import {
    handleIncomingRedirect, 
    login, 
    fetch, 
    getDefaultSession
} from "@inrupt/solid-client-authn-browser";
import {
    getSolidDataset, 
    saveSolidDatasetAt, 
    getThing, 
    getStringNoLocale, 
    getUrlAll,
    getUrl,
    getDatetime,
    setStringNoLocale,
    setThing
} from "@inrupt/solid-client";
import {VCARD, FOAF} from "@inrupt/vocab-common-rdf";

const SOLID_IDENTITY_PROVIDER = "https://solidcommunity.net";

async function loginAndFetch() {
    await handleIncomingRedirect();
    if(!getDefaultSession().info.isLoggedIn) {
        await login({
            oidcIssuer: SOLID_IDENTITY_PROVIDER,
            clientName: "Inrupt tutorial client app",
            redirectUrl: window.location.href
        });
    }

    const WEBID = getDefaultSession().info.webId;
    // const WEBID = "https://docs-example.inrupt.net/profile/card";
    const myDataset = await getSolidDataset(
        WEBID, { fetch }
    );

    const profile = getThing(
        myDataset,
        WEBID
    );
    
    const acquaintances = getUrlAll(profile, FOAF.knows)
    const fn = getStringNoLocale(profile, VCARD.fn);
    const role = getStringNoLocale(profile, VCARD.role);
    const bday = getDatetime(profile, VCARD.bday);
    const photo = getUrl(profile, VCARD.hasPhoto);

    document.querySelector('#user-name').innerHTML = fn;
    document.querySelector('#user-photo').src = photo;
    document.querySelector('#user-role').innerHTML = role;
    document.querySelector('#user-link').innerHTML = WEBID;

    document.querySelector('#user-name-input').value = fn;
    document.querySelector('#user-role-input').value = role;
}

async function saveUserData({name, role}) {
    const WEBID = getDefaultSession().info.webId;

    const myDataset = await getSolidDataset(
        WEBID, { fetch }
    );
    const profile = getThing(myDataset, WEBID);

    let updatedProfile = setStringNoLocale(profile, VCARD.fn, name);
    const myChangedDataset = setThing(myDataset, updatedProfile);
    const savedProfileResource = await saveSolidDatasetAt(
        WEBID,
        myChangedDataset,
        {fetch}
    );

    console.log(savedProfileResource);
    // updatedProfile = addStringNoLocale(updatedProfile, FOAF.nick, "docs");
}

document.querySelector("#form-save-user").addEventListener('submit', function(e) {
    e.preventDefault();
    
    saveUserData({
        name: document.querySelector('#user-name-input').value,
        role: document.querySelector('#user-role-input').value,
    });
});

loginAndFetch();