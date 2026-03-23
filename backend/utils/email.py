import os
import resend

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL")
ADMIN_NOTIFICATION_EMAIL = os.environ.get("ADMIN_NOTIFICATION_EMAIL")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def send_new_application_email(data: dict):
    if not RESEND_API_KEY:
        return
    try:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #003D7A, #0080C8); padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">iWhistle</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0 0; font-size: 14px;">New Partnership Application</p>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #003D7A; font-size: 18px;">Application Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Organization:</td><td style="padding: 6px 0; font-weight: 600; font-size: 14px;">{data.get('partnerOrgName', 'N/A')}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Contact:</td><td style="padding: 6px 0; font-size: 14px;">{data.get('contactName', 'N/A')}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Email:</td><td style="padding: 6px 0; font-size: 14px;">{data.get('contactEmail', 'N/A')}</td></tr>
              <tr><td style="padding: 6px 0; color: #6b7280; font-size: 14px;">Submitted:</td><td style="padding: 6px 0; font-size: 14px;">{data.get('created_at', 'N/A')}</td></tr>
            </table>
            <div style="margin-top: 24px; padding: 16px; background: white; border-radius: 6px; border-left: 4px solid #0080C8;">
              <p style="margin: 0; color: #374151; font-size: 14px;">Login to the <strong>Admin Dashboard</strong> to review and manage this application.</p>
            </div>
          </div>
        </div>
        """
        params = {
            "from": SENDER_EMAIL,
            "to": [ADMIN_NOTIFICATION_EMAIL],
            "subject": f"New Partnership Application: {data.get('partnerOrgName', 'Unknown')}",
            "html": html,
        }
        resend.Emails.send(params)
    except Exception as e:
        print(f"Email notification failed: {e}")
