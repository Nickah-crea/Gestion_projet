package com.example.films.service;

import com.example.films.dto.EmailRequest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmailWithAttachment(EmailRequest emailRequest) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(emailRequest.getToEmail());
        helper.setSubject(emailRequest.getSubject());
        helper.setText(emailRequest.getMessage());
        
        // Ajouter la pièce jointe PDF
        if (emailRequest.getPdfData() != null) {
            ByteArrayResource attachment = new ByteArrayResource(emailRequest.getPdfData()) {
                @Override
                public String getFilename() {
                    return emailRequest.getAttachmentName();
                }
            };
            helper.addAttachment(emailRequest.getAttachmentName(), attachment);
        }
        
        mailSender.send(message);
    }
}