import {
    getSolidDataset,
    getThing,
    setThing,
    getStringNoLocale,
    setStringNoLocale,
    saveSolidDatasetAt,
    getUrl,
    getDatetimeAll
} from "@inrupt/solid-client";
import { Session, fetch } from "@inrupt/solid-client-authn-browser";
import { VCARD } from "@inrupt/vocab-common-rdf";


let webId = localStorage.getItem('webId');
const SOLID_IDENTITY_PROVIDER = "https://solidcommunity.net";

const btnLogin = document.querySelector('#btn-login');
const session = new Session();

async function login() {
    if (!session.info.isLoggedIn) {
        console.log('loggin in');
        await session.login({
            oidcIssuer: SOLID_IDENTITY_PROVIDER,
            clientName: "Inrupt tutorial client app",
            redirectUrl: window.location.href
        });
    }
}

async function handleRedirectAfterLogin() {
    await session.handleIncomingRedirect(window.location.href);
    if (session.info.isLoggedIn) {
        // Update the page with the status.
        webId = session.info.webId;
        localStorage.setItem('webId', webId);
        console.log(`Your session is logged in with the WebID ${session.info.webId}.`);
    }
}
handleRedirectAfterLogin();

async function readProfile() {
    let myDataset;
    try {
        if (session.info.isLoggedIn) {
            myDataset = await getSolidDataset(
                webId, { 
                // fetch: session.fetch 
                fetch: fetch 
            });
        } else {
            myDataset = await getSolidDataset(webId);
        }
    } catch (error) {
        console.log(`Entered value [${webId}] does not appear to be a WebID. Error: [${error}]`);
        return false;
    }

    const profile = getThing(myDataset, webId);

    // Get the formatted name (fn) using the property identifier "http://www.w3.org/2006/vcard/ns#fn".
    // VCARD.fn object is a convenience object that includes the identifier string "http://www.w3.org/2006/vcard/ns#fn".
    // As an alternative, you can pass in the "http://www.w3.org/2006/vcard/ns#fn" string instead of VCARD.fn.
    
    const formattedName = getStringNoLocale(profile, VCARD.fn);
    const role = getStringNoLocale(profile, VCARD.role);
    // const bday = getDatetime(profile, VCARD.bday);
    const photo = getUrl(profile, VCARD.hasPhoto);

    document.querySelector('#user-name').innerHTML = formattedName;
    document.querySelector('#user-photo').src = photo;
    document.querySelector('#user-role').innerHTML = role;
    document.querySelector('#user-link').innerHTML = webId;
    // Update the page with the retrieved values.
}

if(webId) {
    readProfile();
}


btnLogin.onclick = function () {
    login();
};
