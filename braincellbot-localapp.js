require('dotenv').config();
require("firebase/auth");
require("firebase/firestore");
const firebase = require('firebase/app');
const axios = require('axios');
const img2b64 = require('image-to-base64');

axios.defaults.headers['authority'] = 'discordapp.com';
axios.defaults.headers['accept-language'] = 'en-US';
axios.defaults.headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gechko) ' +
    'Chrome/82.0.4069.0 Safari/537.36';
axios.defaults.headers['content-type'] = 'application/json';
axios.defaults.headers['accept'] = '*/*';
axios.defaults.headers['origin'] = 'https://discordapp.com';
axios.defaults.headers['sec-fetch-site'] = 'same-origin';
axios.defaults.headers['sec-fetch-mode'] = 'cors';
axios.defaults.headers['sec-fetch-dest'] = 'empty';
axios.defaults.headers['referer'] = 'https://discordapp.com/channels/@me';

const custom_token = process.env.CUSTOM_TOKEN;

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    projectId: 'braincell-bot-dpy',
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.signInWithCustomToken(custom_token).catch(function(error){
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
});

// TODO: Listen for changes on db and invoke corresponding function
const db = firebase.firestore();

auth.onAuthStateChanged(function(user) {
    if (user) {
        const uid = user.uid;
        const doc_ref = db.collection('users').doc(uid);

        const user_ = db.collection('users').doc(process.env.ID);
        const observer = user_.onSnapshot(docSnapshot => {
            if(docSnapshot.data()['flag']){
                console.log('Checking for updates...');
                check_status(uid);
                check_avatar(uid);
            }

        }, err => {
            console.log(`Encountered error: ${err}`);
        });

        doc_ref.get().then(function(doc) {
            if (doc.exists) {
                console.log(doc.id, ' => ', doc.data());
            } else {
                console.log("No such document!");
            }
        }).catch(function(error){
            console.log("Error getting document:", error);
        })
    }else {
        console.log("User signed out.");
    }
});



function check_status(uid) {
    db.doc(`users/${uid}/commands/counter`).get()
        .then(function(doc){
            if(doc.data()['flag']){
                console.log('Found status update...');
                change_status(doc.data()['status'])
            }
        })
}


function check_avatar(uid) {
    db.doc(`users/${uid}/commands/newpfp`).get()
        .then(function(doc){
            if (doc.data()['flag']){
                console.log('Found avatar update...');
                change_avatar(doc.data()['link'])
            }
        });
}


function change_status(status) {
    const config = {
        url: 'https://discordapp.com/api/v6/users/@me/settings',
        method: 'patch',
        headers: {'authorization': process.env.TOKEN},
        data: {
            'custom_status': {
                'text': status
            }
        }
    };
    axios.request(config)
        .then(function (response){
            if (response.status === 200){
                console.log('Status successfully updated!')
            }
        })
        .catch(function (e){
            console.error(e);
        });
}

function change_avatar(img_link) {

    console.log(img_link);
    axios.get(img_link)
        .then(async function (response){
            console.log(response.status);
            if (response.status===200){
                const dataURI = await img2b64(img_link);
                if (dataURI !== undefined){
                    const config = {
                        url: 'https://discordapp.com/api/v6/users/@me',
                        method: 'patch',
                        data: {
                            'username': process.env.NAME,
                            'email': process.env.EMAIL,
                            'password': process.env.PWD,
                            'avatar': `data:${response.headers['content-type']};base64,${dataURI}`,
                            'discriminator': null,
                            'new_password': null
                        }
                    };
                    axios.request(config)
                        .then(function (response){
                            if (response.status===200){
                                console.log("Avatar successfully updated!");
                            }
                        })
                        .catch(function (error){
                            console.error(error);
                        });
                } }
        })
        .catch(function (error){
            // console.error(error);
        });
}


