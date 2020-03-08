require('dotenv').config();
const firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
const axios = require('axios');

const user_token = process.env.USER_TOKEN;
const custom_token = process.env.CUSTOM_TOKEN;

// firebase.auth().signInWithCustomToken(custom_token).catch(function(error){
//
//     const errorCode = error.code;
//     const errorMessage = error.message;
//     console.log(errorCode);
//     console.log(errorMessage);
// });
const url = 'https://cdn.discordapp.com/attachments/685938304012779592/685966854518210595/220px-Nicholas_Biddle_by_William_Inman.png';

axios.defaults.baseURL = 'https://discordapp.com/api/v6';
axios.defaults.headers['Authorization'] = user_token;
change_avatar(url);
function change_avatar(img_link) {

    console.log(url);
    axios.get(url)
        .then(function (response){
            console.log(response.status);
            console.log(response.statusText);
            if (response.status===200){
                const image = "data:" + response.headers["content-type"] + ";base64," + new Buffer.from(response.data).toString('base64');
                console.log(image);
                if (image !== undefined){
                    const config = {
                        url: '/users/@me',
                        method: 'patch',
                        headers: {
                            'authority': 'discordapp.com',
                            'accept-language': 'en-US',
                            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                                'Chrome/82.0.4069.0 Safari/537.36',
                            'content-type': 'application/json',
                            'accept': '*/*',
                            'origin': 'https://discordapp.com',
                            'sec-fetch-site': 'same-origin',
                            'sec-fetch-mode': 'cors',
                            'sec-fetch-dest': 'empty',
                            'referer': 'https://discordapp.com/channels/@me'
                        },
                        data: {
                            'username': process.env.USER_NAME,
                            'email': process.env.EMAIL,
                            'password': process.env.PASSWORD,
                            'avatar': image,
                            'discriminator': null,
                            'new_password': null
                        }
                    };

                    console.log(config);
                    axios.request(config)
                        .then(function (response){
                            console.log(response.status);
                            console.log(response.statusText);
                            if (response.status===200){
                                console.log("Avatar successfully updated!");
                            }
                        })
                        .catch(function (error){
                            // console.error(error);
                        });
                }
            }
        })
        .catch(function (error){
            console.error(error);
        });
}
