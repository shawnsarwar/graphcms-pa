import {PyramidAPI, makePasswordGrant, makeTokenGrant} from "../../utils/pyramid";
import {UserInfo} from "../../utils/api_types";
import  {
    LoginCredentials,
    LoginSession
} from './authSlice'

export async function makeSession(creds: LoginCredentials){
    var API: PyramidAPI  = new PyramidAPI(
        makePasswordGrant(creds.domain ,creds.user_name, creds.password)
    );
    await API.signIn();
    var user: UserInfo = await API.getMe().then(response => response?.data);
    var embedToken: string = await API.userGetEmbedToken(creds.user_name, creds.password, creds.domain).then(response => response);
    // TODO Replace after library fix is merged
    if (user === undefined || embedToken === undefined){
        return;
    }
    return {
        token: API.token,
        embedToken: embedToken,
        domain: creds.domain,
        user_id: user.id,
        user_name: creds.user_name,
        password: creds.password // TODO Replace after library fix is merged
    } as LoginSession;
}

export async function validSession(session: LoginSession){
    var API: PyramidAPI = new PyramidAPI(makeTokenGrant(session.domain, session.token));
    API.getMe()
        .then(
            () => {
                return true
            })
        .catch(
            () => {
                return false;
            }
        );
}