# Description

In this demo, we will show you how to authorize a user to access resources through a Microsoft Teams app with a bot. We will use [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/) for OAuth provider and [Microsoft Graph](https://developer.microsoft.com/en-us/graph/) for the protected resources.

After sign-in, this demo will keep OAuth token inside the Teams tab, and also send it to the bot via Web Chat backchannel. Because both web page and bot need to hold a single OAuth token, we are unable to use OAuth card in this demo.

> When dealing with personal data, please respect user privacy. Follow platform guidelines and post your privacy statement online.

## Background

This sample is a simplified and reduced version of the sample "[Single sign-on demo for enterprise apps using OAuth](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/b.sso-for-enterprise)" and modified from "[Single sign-on demo for Intranet apps using OAuth](https://microsoft.github.io/BotFramework-WebChat/07.advanced-web-chat-apps/c.sso-for-intranet)". There are notable differences:

-  In this demo, we are targeting Microsoft Teams "tab apps", which is a set of web pages browsed through an embedded and limited web browser inside Microsoft Teams
   -  **Tab apps are supported on desktop client only.** Microsoft Teams on mobile client do not support embed content in apps and requires external apps for tab content
      -  See "[Tabs on mobile clients](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/tabs/tabs-requirements#tabs-on-mobile-clients)" for more information
   -  OAuth sign-in popup is controlled by Microsoft Teams
      -  See "[Authenticate a user in a Microsoft Teams tab](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/auth-tab-AAD)" for more information
-  We will only allow an authenticated user access to the page and the bot
-  Since we only allow authenticated access
   -  We no longer have UI buttons for sign-in and sign-out, and only use plain HTML instead of a React app
   -  We no longer send the sign-in and sign-out event activity to the bot
-  We only support a single [OAuth 2.0](https://tools.ietf.org/html/rfc6749)) provider; in this demo, we are using [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/)
   -  Azure Active Directory supports PKCE ([RFC 7636](https://tools.ietf.org/html/rfc7636)), which we are using PKCE to simplify setup
   -  If you are using GitHub or other OAuth providers that do not support PKCE, you should use a client secret

This demo does not include any threat models and is designed for educational purposes only. When you design a production system, threat-modelling is an important task to make sure your system is secure and provide a way to quickly identify potential source of data breaches. IETF [RFC 6819](https://tools.ietf.org/html/rfc6819) and [OAuth 2.0 for Browser-Based Apps](https://tools.ietf.org/html/draft-ietf-oauth-browser-based-apps-01#section-9) is a good starting point for threat-modelling when using OAuth 2.0.

# How to run locally

This demo integrates with Azure Active Directory and Microsoft Teams. You will need to set it up in order to host the demo.

1. [Start ngrok tunnel for Microsoft Teams app](#start-ngrok-tunnel-for-microsoft-teams-app)
1. [Clone the code](#clone-the-code)
1. [Setup OAuth via Azure Active Directory](#setup-oauth-via-azure-active-directory)
1. [Setup Azure Bot Services](#setup-azure-bot-services)
1. [Setup a new Microsoft Teams app and install it locally](#setup-a-new-microsoft-teams-app-and-install-it-locally)
1. [Prepare and run the code](#prepare-and-run-the-code)

## Start ngrok tunnel for Microsoft Teams app

Since Microsoft Teams only supports `https://` addresses, we will be using ngrok tunnel to provide a temporary HTTPS tunnel for this demo.

1. Download [ngrok](https://ngrok.com/)
1. Run `ngrok http 5000 --host-header=localhost:5000`
1. Write down the Microsoft Teams app tunnel URL in this step
   -  In the steps below, we will refer this URL as https://a1b2c3d4.ngrok.io/
   -  You should replace it with the tunnel URL you obtained from this step

## Clone the code

To host this demo, you will need to clone the code and run locally.

1. Clone this repository
1. Create two files for environment variables, `/web/.env`
   -  In `/web/.env`:
      -  Write `OAUTH_REDIRECT_URI=https://a1b2c3d4.ngrok.io/api/oauth/callback`
         -  When Azure Active Directory completes the authorization flow, it will send the browser to this URL. This URL must be accessible by the browser from the end-user machine

## Setup OAuth via Azure Active Directory
1. Go to the [Application Registration Portal](https://aka.ms/appregistrations) and sign in with the same account that you used to register your bot.
2. Find your application in the list and click on the name to edit.
3. Navigate to **Authentication** under **Manage** and add the following redirect URLs:
    - `https://token.botframework.com/.auth/web/redirect`
    - Add these URL as *Single-page application* `https://<your_tunnel_domain>/silent-end` and `https://<your_tunnel_domain>/api/oauth/callback`
    

4. Additionally, under the **Implicit grant** subsection select **Access tokens** and **ID tokens**

5. Click on **Expose an API** under **Manage**. Select the Set link to generate the Application ID URI in the form of api://{AppID}. Insert your fully qualified domain name (with a forward slash "/" appended to the end) between the double forward slashes and the GUID. The entire ID should have the form of: api://<your_tunnel_domain>/{AppID}
6. Select the **Add a scope** button. In the panel that opens, enter `access_as_user` as the **Scope name**.
7. Set Who can consent? to Admins and users

8. Fill in the fields for configuring the admin and user consent prompts with values that are appropriate for the `access_as_user` scope. Suggestions:
    - **Admin consent title:** Teams can access the user’s profile
    - **Admin consent description**: Allows Teams to call the app’s web APIs as the current user.
    - **User consent title**: Teams can access your user profile and make requests on your behalf
    - **User consent description:** Enable Teams to call this app’s APIs with the same rights that you have
9. Ensure that **State** is set to **Enabled**

10. Select **Add scope**
    - Note: The domain part of the **Scope name** displayed just below the text field should automatically match the **Application ID** URI set in the previous step, with `/access_as_user` appended to the end; for example:
        - `api://<your_tunnel_domain>/<aad_application_id>/access_as_user`
    - If you are facing any issue in your app, please uncomment [this] line( https://github.com/OfficeDev/Microsoft-Teams-Samples/blob/main/samples/app-auth/nodejs/src/AuthBot.ts#L119) and put your debugger for local debug.
   
11. In the **Authorized client applications** section, you identify the applications that you want to authorize to your app’s web application. Each of the following IDs needs to be entered:
    - `1fec8e78-bce4-4aaf-ab1b-5451cc387264` (Teams mobile/desktop application)
    - `5e3ce6c0-2b1f-4285-8d4b-75ee78787346` (Teams web application)
**Note** If you want to test or extend your Teams apps across Office and Outlook, kindly add below client application identifiers while doing Azure AD app registration in your tenant:
    * `4765445b-32c6-49b0-83e6-1d93765276ca` (Office web)
    * `0ec893e0-5785-4de6-99da-4ed124e5296c` (Office desktop)
    * `bc59ab01-8403-45c6-8796-ac3ef710b3e3` (Outlook web)
    * `d3590ed6-52b3-4102-aeff-aad2292ab01c` (Outlook desktop)
    
12. Navigate to **API Permissions**, and make sure to add the following delegated permissions:
    - User.Read
    - email
    - offline_access
    - openid
    - profile
13. Scroll to the bottom of the page and click on "Add Permissions".
-  Go to your [Azure Active Directory](https://ms.portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/Overview)
-  Create a new application
   1. Select "App registrations"
   1. Click "New registration"
   1. Fill out "Name", for example, "Web Chat SSO Sample"
   1. In "Redirect URI (optional)" section, add a new entry
      1. Select "Public client (mobile & desktop)" as type
         -  Instead of client secret, we are using PKCE ([RFC 7636](https://tools.ietf.org/html/rfc7636)) to exchange for authorization token, thus, we need to set it to ["Public client" instead of "Web"](https://docs.microsoft.com/en-us/azure/active-directory/develop/v1-protocols-oauth-code#use-the-authorization-code-to-request-an-access-token)
      1. Enter `http://a1b2c3d4.ngrok.io/api/oauth/callback` as the redirect URI
         -  This must match `OAUTH_REDIRECT_URI` in `/web/.env` we saved earlier
   -  Click "Register"
-  Save the client ID
   1. Select "Overview"
   1. On the main pane, copy the content of "Application (client) ID" to `/web/.env`, it should looks be a GUID
      -  `OAUTH_CLIENT_ID=12345678abcd-1234-5678-abcd-12345678abcd`

## Setup a new Microsoft Teams app and install it locally

> This section is based on the Microsoft Teams article named "[Add tabs to Microsoft Teams apps](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/tabs/tabs-overview)".

1. Create a Teams App
   If you don’t already have a Teams app, create one using the `Microsoft Developer Portal`
1. In the Developer Portal, click on the "Create a new app" button
1. Fill out "App details" under "Details", for example:
   1. For "Name", enter "Web Chat SSO"
   1. Under "Descriptions"
      1. For both "Short description" and "Long description", enter "Company landing page with Web Chat in MCS"
   1. Under "Developer information"
      1. For "Name", enter "My Company"
      1. For "Website", enter `https://mycompany.com/`
   1. Under "App URLs"
      1. For "Privacy statement", enter `https://mycompany.com/privacy.html`
      1. For "Terms of use", enter `https://mycompany.com/termsofuse.html`
   1. Add Application ID
      1. Specify the app ID assigned when you registered your app with Azure Active Directory. This is the same ID you saved in the "[Setup OAuth via Azure Active Directory](#setup-oauth-via-azure-active-directory)" step
1. Fill out "Tabs" under "App features"
   1.  Click oln Personal app" section, click "Add a tab"
      1. For "Name", enter "My Company"
      1. For "Entity ID", enter "webchat"
      1. For "Content URL", enter `https://a1b2c3d4.ngrok.io/`
         -  This URL will be based on the ngrok tunnel you create in "[Start ngrok tunnel](#start-ngrok-tunnel)" section
      1. Click "Save" button
1. Under "Test and distribute" of "Finish" section
   1. Click "Install" button
   1. On the "Web Chat SSO" dialog, click "Install" button again

## Prepare and run the code

1. Under both the `web` folder, run the following:
   1. `npm install`
   1. `npm start`
1. In Microsoft Teams, open the new app you just created in the "[Setup a new Microsoft Teams app and install it locally](#setup-a-new-microsoft-teams-app-and-install-it-locally)" step
   1. Click "..." on the navigation bar below "Files"
   1. Click "Web Chat SSO"

# Things to try out

-  When you open the tab in the app for the first time, the tab should automatically popup an Azure Active Directory sign-in dialog
-  Type, "Hello" in Web Chat
   -  The bot should be able to identify your full name by using your access token on Microsoft Graph

# Code

-  `/web/` is the REST API for handling OAuth requests
   -  `GET /api/oauth/authorize` will redirect to Azure AD OAuth authorize page at https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize
   -  `GET /api/oauth/callback` will handle callback from Azure AD OAuth
   -  `GET /api/directline/token` will generate a new Direct Line token for the React app
   -  It will serve a static `voicebot.html`

# Overview

This sample includes multiple parts:

-  A basic web page that:
   -  Checks your access token or open a pop-up to OAuth provider if it is not present or valid
      -  The pop-up is provided by [Microsoft Teams JavaScript client SDK](https://docs.microsoft.com/en-us/javascript/api/overview/msteams-client)
   -  Is integrated with Web Chat and piggybacks your OAuth access token on every user-initiated activity through `channelData.oauthAccessToken`
-  Bot
   -  On every message, it will extract the OAuth access token and obtain user's full name from Microsoft Graph

## Assumptions

-  Developer understand and has hands-on experience on creating a Microsoft Teams app for tab apps
-  Developer has an existing Intranet web app that uses OAuth to access protected resources
   -  We assume the OAuth access token lives in the browser's memory and is accessible through JavaScript
      -  Access token can live in browser memory but must be secured during transmit through the use of TLS
      -  More about security considerations can be found at [IETF RFC 6749 Section 10.3](https://tools.ietf.org/html/rfc6749#section-10.3)
   -  We assume the web app can be hosted as a tab under Microsoft Teams app

## Goals

-  Website and bot conversation supports authenticated access only
   -  If the end-user is not authenticated or does not carry a valid authenticated token, a sign-in dialog will appear
   -  This website resembles a company landing page, in which authenticated content (e.g. vacation balance) and bot conversation is required to co-exist on the same page
-  Bot will receive OAuth access token from the website

## Content of the `.env` files

The `.env` files hold the environment variables critical to run the service. These are usually security-sensitive information and must not be committed to version control. Although we recommend keeping these keys in Azure Vault, for simplicity of this sample, we would keep them in `.env` files.

To ease the setup of this sample, here is the template of `.env` files.

### `/web/.env`

```
DIRECT_LINE_SECRET=<your-direct-line-secret>
OAUTH_CLIENT_ID=12345678abcd-1234-5678-abcd-12345678abcd
OAUTH_REDIRECT_URI=https://a1b2c3d4.ngrok.io/api/oauth/callback
PROXY_BOT_URL=http://localhost:3978
```

# Frequently asked questions

## How can I reset my authorization?

To reset application authorization, please follow the steps below.

1. On the [AAD dashboard page](https://portal.office.com/account/#apps), wait until "App permissions" loads. Here you see how many apps you have authorized
1. Click "Change app permissions"
1. In the "You can revoke permission for these apps" section, click the "Revoke" button below your app registration

# Further reading

## Related articles

-  [RFC 6749: The OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
-  [RFC 6819: OAuth 2.0 Threat Model and Security Considerations](https://tools.ietf.org/html/rfc6819)
-  [RFC 7636: Proof Key for Code Exchange by OAuth Public Clients](https://tools.ietf.org/html/rfc7636)
-  [IETF Draft: OAuth 2.0 for Browser-Based Apps](https://tools.ietf.org/html/draft-ietf-oauth-browser-based-apps-01)
-  [Bot Framework Blog: Enhanced Direct Line Authentication feature](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/)
-  [Microsoft Teams: Add tabs to Microsoft Teams apps](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/tabs/tabs-overview)
-  [Microsoft Teams: Authenticate a user in a Microsoft Teams tab](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/auth-tab-AAD)
-  [Microsoft Teams: Tabs on mobile clients](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/tabs/tabs-requirements#tabs-on-mobile-clients)

## OAuth access token vs. refresh token

To make this demo simpler, we are obtaining the access token via Authorization Code Grant flow instead of the refresh token. Access token is short-lived and considered secure to live inside the browser.

In your production scenario, you may want to obtain the refresh token with "Authorization Code Grant" flow instead of using the access token. We did not use the refresh token in this sample as it requires server-to-server communications and secured persistent storage, it would greatly increase the complexity of this demo.

## Threat model

To reduce complexity, this sample is limited in scope. In your production system, you should consider enhancing it and review its threat model.

-  Refreshing the access token
   -  Using silent prompt for refreshing access token
      -  Some OAuth providers support `?prompt=none` for refreshing access token silently through `<iframe>`
   -  Using Authorization Code Grant flow with refresh token
      -  Save the refresh token on the server side of your web app. Never expose it to the browser or the bot
      -  This will also create a smooth UX by reducing the need for UI popups
-  Threat model
   -  IETF [RFC 6819](https://tools.ietf.org/html/rfc6819) is a good starting point for threat-modelling when using OAuth 2.0

## Microsoft Teams: Personal tab vs. team tab

-  Personal tabs are tabs that are shown in the Microsoft Teams app only, i.e. only visible for the current user
-  Team tabs are tabs that are configured on a per-conversation basis, i.e. tab will be shown in a conversation with one or more team members

Because team tabs are designed to be used collaboratively by two or more users, content shown inside the team tab should be synchronized in terms of content and interactions. For example, a tab showing Microsoft Excel web app that two or more users can collaboratively edit the content.

For content that is not designed to be used by multiple users at the same time (for example, conversation with a bot), this type of content should be limited to personal tab only to reduce confusion.
