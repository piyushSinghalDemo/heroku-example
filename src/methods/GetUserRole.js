import _ from 'lodash';
export default function getUserRole(userRole ,service, name){
    if(userRole && userRole[service] && _.indexOf(userRole[service], name) !== -1)
            return true;
        else
            return false;    
}
