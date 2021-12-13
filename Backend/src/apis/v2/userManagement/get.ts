//tslint:disable:strict-comparisons
import { API, Handler } from '@apis/index';
import { UserDocument } from '@models/index';
import { config } from '@root/config';
import {
  appLogger,
  getCreateUserConfig,
  getTeamMembersDetails,
  getTeams2,
  getUserDocument,
  getUserDocumentFromEmail,
  responseBuilder,
  TeamMembers,
} from '@utils/index';
import { Response } from 'express';

interface GetUsers {
  headers: {
    user: {
      'cognito:groups': string[];
      'cognito:username': string;
      email: string;
      orgId?: string;
    };
  };
  params: {
    type: string;
  };
  query: {
    email: string;
  };
}

async function handler(request: GetUsers, response: Response) {
  appLogger.info({ GetUsers: request }, 'Inside Handler');

  const { headers, params, query } = request;
  // if (headers.user['cognito:groups'][0] !== 'Manager' && headers.user['cognito:groups'][0] !== 'Admin') {
  //     return responseBuilder.unauthorized(new Error('InvalidUser'), response);
  // }

  //    if(params.type === 'team') {
  //        const userL: any = await getTeamList2(headers.user['cognito:groups'][0] === 'Admin' ? 'admin' : headers.user.email);
  //        appLogger.info({getTeamList2: userL});
  //        return responseBuilder.ok(userL, response);
  //    }
  if (params.type === 'createuser') {
    const createUser: any = await getCreateUserConfig(
      headers.user.orgId ? headers.user.orgId : config.defaults.orgId,
      headers.user['cognito:groups'][0] === 'Admin'
        ? 'admin'
        : headers.user.email
    );
    appLogger.info({ getCreateUserConfig: createUser });
    return responseBuilder.ok(createUser, response);
  }
  if (params.type === 'getusers' && query.email) {
    const getUserDetails: any = await getUserDocumentFromEmail(query.email);
    appLogger.info({ getUserDocumentFromEmail: getUserDetails });
    getUserDetails[0].teams = getUserDetails[0].teams.map(
      (team: any) => team.name
    );
    const createUser: any = await getCreateUserConfig(
      headers.user.orgId ? headers.user.orgId : config.defaults.orgId,
      headers.user['cognito:groups'][0] === 'Admin'
        ? 'admin'
        : headers.user.email
    );
    appLogger.info({ getCreateUserConfig: createUser });
    return responseBuilder.ok(
      { config: createUser.config, values: getUserDetails[0] },
      response
    );
  }
  if (params.type === 'allUsers') {
    const teamList: string[] = (
      await getTeams2(
        headers.user['cognito:groups'][0] === 'Admin'
          ? 'admin'
          : headers.user.email
      )
    ).map((val: any) => val.teamId);
    appLogger.info({ getTeams2: teamList });
    const userDoc: UserDocument = await getUserDocument({
      cognitoUserId: headers.user['cognito:username'],
    });
    appLogger.info({ getUserDocument: userDoc });
    /*userDoc.teams.forEach((val: any) => {
            if(!teamList.includes(val.name)) {
                teamList.push(val.name);
            }
        });*/
    let teamMembersForATeam: TeamMembers[] = new Array();
    for (const team of teamList) {
      teamMembersForATeam = teamMembersForATeam.concat(
        await getTeamMembersDetails(team)
      );
    }
    //let resultArray = teamMembersForATeam;
    const temp = new Set();
    teamMembersForATeam = teamMembersForATeam.filter((val: TeamMembers) => {
      if (!temp.has(val.emailId)) {
        temp.add(val.emailId);
        return true;
      }
      return false;
    });
    teamMembersForATeam.sort((a: TeamMembers, b: TeamMembers) => {
      if (a.emailId > b.emailId) {
        return 1;
      }
      if (a.emailId < b.emailId) {
        return -1;
      }
      return 0;
    });
    appLogger.info({ teamMembersForATeam });
    const userCount = teamMembersForATeam.length;
    return responseBuilder.ok(
      { users: teamMembersForATeam, userCount },
      response
    );
  }
  if (params.type) {
    const teamMembersDetails: any = await getTeamMembersDetails(params.type);
    teamMembersDetails.sort((a: TeamMembers, b: TeamMembers) => {
      if (a.emailId > b.emailId) {
        return 1;
      }
      if (a.emailId < b.emailId) {
        return -1;
      }
      return 0;
    });
    appLogger.info({ getTeamMembersDetails: teamMembersDetails });
    const userCount = teamMembersDetails.length;
    return responseBuilder.ok(
      { users: teamMembersDetails, userCount },
      response
    );
  }
  //    const teamL: any = await getUserList2(headers.user['cognito:groups'][0] === 'Admin' ? 'admin' : headers.user.email);
  //    appLogger.info({getUserList2: teamL});
  //    return responseBuilder.ok(teamL, response);
}

export const api: API = {
  handler: <Handler>(<unknown>handler),
  method: 'get',
  route: '/api/v2/admin/users/:type?',
};

// async function a() {
//     let teamList: string[] = (await getTeams2('rachit.kohli@truminds.com')).map((val: any) => val.teamId);
//         // const userDoc: UserDocument = await getUserDocument({ cognitoUserId: '' });
//         // userDoc.teams.forEach((val: any) => {
//         //     if(!teamList.includes(val.name)) {
//         //         teamList.push(val.name);
//         //     }
//         // });
//         let teamMembersForATeam: TeamMembers[] = new Array();
//         console.log(teamList)
//         for(const team of teamList) {
//             console.log(team)
//             teamMembersForATeam = teamMembersForATeam.concat(await getTeamMembersDetails(team));
//         }
//         console.log(teamMembersForATeam.length,teamMembersForATeam[0])
//         //let resultArray = teamMembersForATeam;
//         teamMembersForATeam.sort((a: TeamMembers, b: TeamMembers) => {
//             if(a.emailId > b.emailId) {
//                 return 1;
//             } else if(a.emailId < b.emailId) {
//                 return -1;
//             }
//             return 0;
//         });
//         let temp = new Set();
//         teamMembersForATeam = teamMembersForATeam.filter((val: TeamMembers) => {
//             if(!temp.has(val.emailId)) {
//                 temp.add(val.emailId);
//                 return true
//             } else  {
//                 return false
//             }
//         });
//         console.log(teamMembersForATeam.length,teamMembersForATeam)
//         if(true) {
//             teamMembersForATeam = teamMembersForATeam.slice((1-1)*25,1*25);
//         }
//         if(false) {
//             const regex = new RegExp('rachit');
//             teamMembersForATeam = teamMembersForATeam.filter((val) => val.emailId.match(regex));
//         }
//         console.log(teamMembersForATeam.length,teamMembersForATeam[0])
// }
// a();
