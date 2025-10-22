package com.example.films.dto;

public class EmailRequest {
    private String toEmail;
    private String subject;
    private String message;
    private String attachmentName;
    private byte[] pdfData;
    
    // Constructeurs
    public EmailRequest() {}
    
    public EmailRequest(String toEmail, String subject, String message, String attachmentName, byte[] pdfData) {
        this.toEmail = toEmail;
        this.subject = subject;
        this.message = message;
        this.attachmentName = attachmentName;
        this.pdfData = pdfData;
    }
    
    // Getters et Setters
    public String getToEmail() { return toEmail; }
    public void setToEmail(String toEmail) { this.toEmail = toEmail; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getAttachmentName() { return attachmentName; }
    public void setAttachmentName(String attachmentName) { this.attachmentName = attachmentName; }
    
    public byte[] getPdfData() { return pdfData; }
    public void setPdfData(byte[] pdfData) { this.pdfData = pdfData; }
}