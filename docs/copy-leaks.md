Please note: This website includes an accessibility system. Press Control-F11 to adjust the website to people with visual disabilities who are using a screen reader; Press Control-F10 to open an accessibility menu.
Accessibility
Press enter for Accessibility for blind peoplewho use screen readers
Press enter for Keyboard Navigation
Press enter for Accessibility menu
Skip to content
Copyleaks Documentation

Search
Ctrl
K
GitHub
Stack Overflow
Toggle theme
Dashboard
Overview
Quickstart
On this page
Overview
🚀 Let’s Get You Started
Create Your Account
Installation
Login
Detect AI-Generated Text
🎉 Congratulations!
What’s Next?
Get Started
Quickstart

Ask AI
Welcome to the Copyleaks Quickstart! This guide will walk you through the essential steps to get you up and running with the Copyleaks API in just a few minutes. Let’s begin.

🚀 Let’s Get You Started
Create Your Account
Before you start, ensure you have the following:

An active Copyleaks account. If you don’t have one, sign up for free.
You can find your API key on the API Dashboard.
Installation
Choose your preferred method for making API calls.

HTTP
cURL
Python
JavaScript
Java
You can interact with the API using any standard HTTP client.

For a quicker setup, we provide a Postman collection. See our Postman guide for instructions.

Login
To perform a scan, we first need to generate an access token. For that, we will use the login endpoint. The API key can be found on the Copyleaks API Dashboard.

Upon successful authentication, you will receive a token that must be attached to subsequent API calls via the Authorization: Bearer <TOKEN> header. This token remains valid for 48 hours.

HTTP
cURL
Python
JavaScript
Java
POST https://id.copyleaks.com/v3/account/login/api

Headers
Content-Type: application/json

Body
{
    "email": "your@email.address",
    "key": "00000000-0000-0000-0000-000000000000"
}

Response

{
    "access_token": "<ACCESS_TOKEN>",
    ".issued": "2025-07-31T10:19:40.0690015Z",
    ".expires": "2025-08-02T10:19:40.0690016Z"
}

Save this token! It’s valid for 48 hours and can be reused for subsequent API calls.

Detect AI-Generated Text
Now let’s test some text. We’ll start with a sample that’s clearly AI-generated:

HTTP
cURL
Python
JavaScript
Java
POST https://api.copyleaks.com/v2/writer-detector/my-first-scan/check
Authorization: Bearer your-access-token-here
Content-Type: application/json

{
  "text": "Artificial intelligence has revolutionized numerous industries by automating complex tasks and providing data-driven insights. Machine learning algorithms can analyze vast datasets to identify patterns that humans might miss. In healthcare, AI assists with diagnosis and drug discovery.",
  "sandbox": true
}

Response

AI Detection Results
{
  "summary": {
    "ai": 0.95,     // 95% likely to be AI-generated
    "human": 0.05   // 5% likely to be human-written
  },
  "results": [
    {
      "classification": 2,  // 2 = AI-generated, 1 = human-written
      "probability": 0.95
    }
  ]
}

🎉 Congratulations!
You have just:

✅ Authenticated with the Copyleaks API
✅ Made your first AI detection request
✅ Interpreted the results
What’s Next?
Check for Plagiarism
Detect plagiarism in text documents using the Copyleaks API. Search billions of sources to find unoriginal content.
Detect AI-Generated Content
Detect AI-generated text via sync or async API calls. This guide covers sync detection-see the Authenticity API Guide for async.
Assess Grammar and Writing Quality
Get writing and grammar suggestions via API. Authenticate, submit text, and access full details in the docs.
Moderate Text
Scan and moderate text content for unsafe or policy-relevant material across 10+ categories.
Ready to scale beyond the basics?
Get a personalized demo and discover how to process thousands of documents seamlessly, integrate Copyleaks into your existing systems, and achieve enterprise-grade accuracy for your specific use case.

Book a Demo
Previous
Overview
Next
Detect Plagiarism in Text

Please note: This website includes an accessibility system. Press Control-F11 to adjust the website to people with visual disabilities who are using a screen reader; Press Control-F10 to open an accessibility menu.
Accessibility
Press enter for Accessibility for blind peoplewho use screen readers
Press enter for Keyboard Navigation
Press enter for Accessibility menu
Skip to content
Copyleaks Documentation

Search
Ctrl
K
GitHub
Stack Overflow
Toggle theme
Dashboard
Overview
Quickstart
Detect Plagiarism in Text
Detect AI-Generated Content in Documents
Assess Writing in Documents
Exclude Template Text
On this page
Overview
🚀 Get Started
Before you begin
Installation
Login
Submit for Scanning
Wait for Completion Webhook
Export Detailed Results
🎉Congratulations!
What’s Next?
Authenticity
Detect Plagiarism in Text

Ask AI
The Copyleaks Authenticity API is the most powerful way to analyze your content for plagiarism. This API is asynchronous - you submit a scan, and Copyleaks notifies your server via webhooks when the results are ready to be retrieved.

This guide will walk you through the process of submitting a scan, enabling plagiarism detection, and exporting the results.

🚀 Get Started
Before you begin
Before you start, ensure you have the following:

An active Copyleaks account. If you don’t have one, sign up for free.
You can find your API key on the API Dashboard.
Installation
Choose your preferred method for making API calls.

HTTP
cURL
Python
JavaScript
Java
You can interact with the API using any standard HTTP client.

For a quicker setup, we provide a Postman collection. See our Postman guide for instructions.

Login
To perform a scan, we first need to generate an access token. For that, we will use the login endpoint. The API key can be found on the Copyleaks API Dashboard.

Upon successful authentication, you will receive a token that must be attached to subsequent API calls via the Authorization: Bearer <TOKEN> header. This token remains valid for 48 hours.

HTTP
cURL
Python
JavaScript
Java
POST https://id.copyleaks.com/v3/account/login/api

Headers
Content-Type: application/json

Body
{
    "email": "your@email.address",
    "key": "00000000-0000-0000-0000-000000000000"
}

Response

{
    "access_token": "<ACCESS_TOKEN>",
    ".issued": "2025-07-31T10:19:40.0690015Z",
    ".expires": "2025-08-02T10:19:40.0690016Z"
}

Save this token! It’s valid for 48 hours and can be reused for subsequent API calls.

Submit for Scanning
Use the Submit File Endpoint to send content for analysis. We suggest you to provide a unique scanId for each submission.

Tip

For testing, set "sandbox": true. Sandbox mode is free and returns mock results.

What is Base64 Encoding?

Base64 converts binary files into text strings so they can be sent via JSON. All programming languages have built-in Base64 encoding functions—see the code examples below for your language.

HTTP
cURL
Python
JavaScript
Java
PUT https://api.copyleaks.com/v3/scans/submit/file/my-plagiarism-scan

Headers
Authorization: Bearer <YOUR_AUTH_TOKEN>
Content-Type: application/json

Body
{
    "base64": "SGVsbG8gd29ybGQh",
    "filename": "file.txt",
    "properties": {
        "webhooks": {
          "status": "https://your-server.com/webhook/{STATUS}"
          },
        "sandbox": true
    }
}

Wait for Completion Webhook
The scan can take some time. Once it’s complete, Copyleaks will send a completed webhook to the status URL you provided. This webhook contains a summary of the scan results, including any result IDs for found plagiarism matches.

Export Detailed Results
After the completed webhook arrives, use the export endpoint to retrieve the detailed plagiarism results using the result IDs you received in the completion webhook.

We will also export the Crawled Version. The crawledVersion webhook contains the text and html version of the document. This can later be used in order to display the report.

In addition, you should also specify a completionWebhook to receive notifications when the export is ready.

HTTP
cURL
Python
JavaScript
Java
POST https://api.copyleaks.com/v3/downloads/my-plagiarism-scan/export/<export_id>

Headers
Authorization: Bearer <your_token>
Content-Type: application/json

Body
{
    "completionWebhook":  "https://your.server/export/completed",
    "maxRetries": 3,
    "developerPayload": "custom_data_identifier",
    "crawledVersion": {
        "endpoint": "https://your.server/webhook/export/crawled",
        "verb": "POST",
        "headers": [
            [
                "header-key",
                "header-value"
            ]
        ]
    },
    "results": [
        {
            "id": "result-1",
            "endpoint": "https://your.server/webhook/export/result/result-1",
            "verb": "POST",
            "headers": [
                [
                    "header-key",
                    "header-value"
                ]
            ]
        }
    ]
}

🎉Congratulations!
You have successfully submitted a scan for plagiarism detection and exported the results. You can now handle the results in your application, display them to users, or take further actions based on the findings.

What’s Next?
Webhooks Overview
Learn how to securely receive and process notifications from Copyleaks.
Viewing Scan Results
Understand the scan result format and how to display it to your users.
Previous
Quickstart
Next
Detect AI-Generated Content in Documents

Please note: This website includes an accessibility system. Press Control-F11 to adjust the website to people with visual disabilities who are using a screen reader; Press Control-F10 to open an accessibility menu.
Accessibility
Press enter for Accessibility for blind peoplewho use screen readers
Press enter for Keyboard Navigation
Press enter for Accessibility menu
Skip to content
Copyleaks Documentation

Search
Ctrl
K
GitHub
Stack Overflow
Toggle theme
Dashboard
Overview
Quickstart
Detect Plagiarism in Text
Detect AI-Generated Content in Documents
Assess Writing in Documents
Exclude Template Text
On this page
Overview
🚀 Get Started
Before you begin
Installation
Login
Submit for Scanning
Wait for Completion Webhook
Interpreting AI Detection Results
Export Detailed Results
🎉Congratulations!
What’s Next?
Authenticity
Detect AI-Generated Content in Documents

Ask AI
The Copyleaks Authenticity API is a powerful way to analyze your content for AI-generated text. It allows you to scan documents like PDF, DOCX, TXT, and other formats to detect whether content was written by humans or generated by AI.

This guide will walk you through the process of submitting a document, enabling AI content detection, and exporting the results.

🚀 Get Started
Before you begin
Before you start, ensure you have the following:

An active Copyleaks account. If you don’t have one, sign up for free.
You can find your API key on the API Dashboard.
Installation
Choose your preferred method for making API calls.

HTTP
cURL
Python
JavaScript
Java
You can interact with the API using any standard HTTP client.

For a quicker setup, we provide a Postman collection. See our Postman guide for instructions.

Login
To perform a scan, we first need to generate an access token. For that, we will use the login endpoint. The API key can be found on the Copyleaks API Dashboard.

Upon successful authentication, you will receive a token that must be attached to subsequent API calls via the Authorization: Bearer <TOKEN> header. This token remains valid for 48 hours.

HTTP
cURL
Python
JavaScript
Java
POST https://id.copyleaks.com/v3/account/login/api

Headers
Content-Type: application/json

Body
{
    "email": "your@email.address",
    "key": "00000000-0000-0000-0000-000000000000"
}

Response

{
    "access_token": "<ACCESS_TOKEN>",
    ".issued": "2025-07-31T10:19:40.0690015Z",
    ".expires": "2025-08-02T10:19:40.0690016Z"
}

Save this token! It’s valid for 48 hours and can be reused for subsequent API calls.

Submit for Scanning
Submission Methods
You can submit content for analysis using multiple methods:

File Upload
Submit documents including PDF, DOCX, TXT and other formats for scanning

URL Scanning
Submit webpages and online documents directly by providing their URL

Text Images
Extract and scan text from images including screenshots and photos

For this guide, we’ll demonstrate document submission. Each submission requires a unique scanId for proper tracking and identification.

File Submission Requirements

Filename: The file extension in the filename parameter must match your document type (e.g., .pdf, .docx, .txt). See the full list of supported ai text detection file types.
Content Encoding: The file content must be Base64 encoded and sent in the base64 property.
What is Base64 Encoding?

Base64 converts binary files into text strings so they can be sent via JSON. All programming languages have built-in Base64 encoding functions—see the code examples below for your language.

Tip

For testing, set "sandbox": true. Sandbox mode is free and returns mock results.
To enable AI detection, ensure "aiGeneratedText": {"detect": true} is set in your properties.

HTTP
cURL
Python
JavaScript
Java
PUT https://api.copyleaks.com/v3/scans/submit/file/my-ai-detection-scan

Headers
Authorization: Bearer <YOUR_AUTH_TOKEN>
Content-Type: application/json

Body
{
    "base64": "<BASE64_ENCODED_PDF_CONTENT>",
    "filename": "my-file.pdf",
    "properties": {
        "webhooks": {
          "status": "https://your-server.com/webhook/{STATUS}"
          },
        "sandbox": true,
        "aiGeneratedText": {
            "detect": true
        }
    }
}

Wait for Completion Webhook
The scan times differ depending on document length. Once it’s complete, Copyleaks will send a completed webhook to the status URL you provided.

Webhook Response Reference

For complete details on the webhook response structure, see the Scan Completed Webhook Reference.

Interpreting AI Detection Results
When the scan is complete, check the notifications.alerts array in the webhook payload.

If the array is empty or does not contain an alert with the code suspected-ai-text, you can assume no AI-generated content was detected.
If such an alert is present, you can inspect its additionalData field for a detailed summary of the AI detection results.
Export Detailed Results
Once the scan is complete, you’ll receive a completed webhook. To get the full analysis needed to display a report, you need to export two key pieces of data using the export endpoint:

AI Detection Results: It provides a detailed breakdown of which parts of the text were identified as potentially AI-generated. You’ll receive a result ID for the AI detection in the completed webhook, which you’ll use for the export. See the AI Detection Result data type.

Crawled Version: This is the plain text or HTML representation of the original scanned document. See the Crawled Version data type.

Your export request must specify a completionWebhook to be notified when the exported data is ready for download.

HTTP
cURL
Python
JavaScript
Java
POST https://api.copyleaks.com/v3/downloads/my-ai-detection-scan/export/<export_id>

Headers
Authorization: Bearer <your_token>
Content-Type: application/json

Body
{
    "completionWebhook":  "https://your.server/export/completed",
    "maxRetries": 3,
    "developerPayload": "custom_data_identifier",
    "crawledVersion": {
        "endpoint": "https://your.server/webhook/export/crawled",
        "verb": "POST",
        "headers": [
            [
                "header-key",
                "header-value"
            ]
        ]
    },
    "results": [
        {
            "id": "ai-result-1",
            "endpoint": "https://your.server/webhook/export/ai-result/ai-result-1",
            "verb": "POST",
            "headers": [
                [
                    "header-key",
                    "header-value"
                ]
            ]
        }
    ]
}

🎉Congratulations!
You have successfully submitted a scan for AI-generated content detection and exported the results. You can now handle the results in your application, display them to users with confidence scores and highlighted AI-generated sections, or take further actions based on the findings.

What’s Next?
Webhooks Overview
Learn how to securely receive and process notifications from Copyleaks.
Viewing AI Detection Results
Understand the AI detection result format and how to display confidence scores to your users.
Previous
Detect Plagiarism in Text
Next
Assess Writing in Documents
