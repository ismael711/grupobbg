<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');

// ── Helpers ──────────────────────────────────────────────────
function json_out(string $status, string $message): never {
    echo json_encode(['status' => $status, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitize(mixed $value): string {
    return htmlspecialchars(strip_tags(trim((string) $value)), ENT_QUOTES, 'UTF-8');
}

// ── Aceitar apenas POST ───────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out('error', 'Método não permitido.');
}

// ── Honeypot anti-spam ────────────────────────────────────────
if (!empty($_POST['website'])) {
    // Bot detectado — retorna sucesso falso para não revelar o filtro
    json_out('success', 'Mensagem enviada com sucesso!');
}

// ── Coletar e validar campos ──────────────────────────────────
$tipo_form = isset($_POST['empresa']) ? 'orcamento' : 'contato';

// ── Campos comuns ─────────────────────────────────────────────
$nome     = sanitize($_POST['nome']     ?? '');
$email    = sanitize($_POST['email']    ?? '');
$telefone = sanitize($_POST['telefone'] ?? '');
$mensagem = sanitize($_POST['mensagem'] ?? '');

if (strlen($nome) < 2) {
    json_out('error', 'Informe seu nome.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_out('error', 'E-mail inválido.');
}

if ($tipo_form === 'contato') {
    $assunto = sanitize($_POST['assunto'] ?? '');
    if (empty($assunto)) {
        json_out('error', 'Selecione um assunto.');
    }
    if (strlen($mensagem) < 10) {
        json_out('error', 'A mensagem deve ter pelo menos 10 caracteres.');
    }
} else {
    // Campos exclusivos do orçamento
    $empresa    = sanitize($_POST['empresa']    ?? '');
    $whatsapp   = sanitize($_POST['whatsapp']   ?? '');
    $quantidade = sanitize($_POST['quantidade'] ?? '');
    $cidade     = sanitize($_POST['cidade']     ?? '');
    $estado     = sanitize($_POST['estado']     ?? '');
    $tipo_uni   = sanitize($_POST['tipo']       ?? '');

    if (strlen($empresa) < 2)  json_out('error', 'Informe o nome da empresa.');
    if (empty($quantidade))    json_out('error', 'Informe a quantidade.');
    if (strlen($cidade) < 2)   json_out('error', 'Informe a cidade.');
    if (empty($estado))        json_out('error', 'Selecione o estado.');
    if (empty($tipo_uni))      json_out('error', 'Selecione o tipo de uniforme.');
}

// ── Carregar senha do arquivo separado (fora do controle de versão) ──
$senhaPath = __DIR__ . '/config-email.php';
if (!file_exists($senhaPath)) {
    json_out('error', 'Configuração de e-mail não encontrada no servidor.');
}
$senha = require $senhaPath;

// ── PHPMailer ─────────────────────────────────────────────────
require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $mail = new PHPMailer(true);

    // Configuração do servidor SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.hostgator.com.br';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'comercial@grupobbg.com.br';
    $mail->Password   = $senha;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    // Remetente e destinatário
    $mail->setFrom('comercial@grupobbg.com.br', 'Site Grupo BBG');
    $mail->addAddress('comercial@grupobbg.com.br', 'Site Grupo BBG');
    $mail->addReplyTo($email, $nome);

    // Conteúdo do e-mail
    $mail->isHTML(true);

    if ($tipo_form === 'contato') {
        $mail->Subject = "Contato via site: {$assunto}";
        $mail->Body    = "
            <p><strong>Nome:</strong> {$nome}</p>
            <p><strong>E-mail:</strong> {$email}</p>
            <p><strong>Telefone:</strong> " . ($telefone ?: '(não informado)') . "</p>
            <p><strong>Assunto:</strong> {$assunto}</p>
            <hr>
            <p><strong>Mensagem:</strong></p>
            <p>" . nl2br($mensagem) . "</p>
        ";
        $mail->AltBody = "Nome: {$nome}\nE-mail: {$email}\nTelefone: {$telefone}\nAssunto: {$assunto}\n\nMensagem:\n{$mensagem}";
    } else {
        $mail->Subject = "Solicitação de orçamento: {$tipo_uni} — {$empresa}";
        $mail->Body    = "
            <p><strong>Empresa:</strong> {$empresa}</p>
            <p><strong>Responsável:</strong> {$nome}</p>
            <p><strong>E-mail:</strong> {$email}</p>
            <p><strong>Telefone:</strong> " . ($telefone ?: '(não informado)') . "</p>
            <p><strong>WhatsApp:</strong> " . ($whatsapp ?: '(não informado)') . "</p>
            <p><strong>Tipo de uniforme:</strong> {$tipo_uni}</p>
            <p><strong>Quantidade estimada:</strong> {$quantidade}</p>
            <p><strong>Cidade/Estado:</strong> {$cidade} / {$estado}</p>
            <hr>
            <p><strong>Descrição do pedido:</strong></p>
            <p>" . (strlen($mensagem) > 0 ? nl2br($mensagem) : '(não informado)') . "</p>
        ";
        $mail->AltBody = "Empresa: {$empresa}\nResponsável: {$nome}\nE-mail: {$email}\nTelefone: {$telefone}\nWhatsApp: {$whatsapp}\nTipo: {$tipo_uni}\nQuantidade: {$quantidade}\nCidade: {$cidade}/{$estado}\n\nDescrição:\n{$mensagem}";
    }

    $mail->send();
    json_out('success', 'Mensagem enviada com sucesso! Entraremos em contato em breve.');

} catch (Exception $e) {
    json_out('error', 'Não foi possível enviar a mensagem. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
}
