// export/emailExport.js

/**
 * Envoie un PDF par email à une liste de destinataires
 * @param {Blob} pdfBlob - Le blob du PDF à envoyer
 * @param {Array} recipients - Liste des destinataires {email, name}
 * @param {Object} emailForm - Contenu de l'email {subject, message}
 * @param {string} resultatType - Le type du résultat
 * @param {string} resultatTitre - Le titre du résultat
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function envoyerPDFParEmail(pdfBlob, recipients, emailForm, resultatType, resultatTitre) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    
    reader.onload = async () => {
      const base64Data = reader.result.split(',')[1];
      const recipientEmails = recipients.map(r => r.email);
      
      const promises = recipientEmails.map(async (email) => {
        const emailRequest = {
          toEmail: email,
          subject: emailForm.subject,
          message: emailForm.message,
          attachmentName: `${resultatType}_${resultatTitre}_${new Date().toISOString().split('T')[0]}.pdf`,
          pdfData: base64Data
        };

        const response = await fetch('/api/export/send-pdf-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailRequest)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} pour ${email}`);
        }

        return response.json();
      });

      const results = await Promise.allSettled(promises);
      
      const succes = results.filter(result => result.status === 'fulfilled' && result.value.success);
      const echecs = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success));
      
      resolve({
        succes: succes.length,
        echecs: echecs.length,
        details: results
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du PDF'));
    };
  });
}

