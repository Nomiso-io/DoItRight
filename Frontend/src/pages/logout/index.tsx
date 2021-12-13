import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '../../reducers';
//import { AuthMethods } from '../../components/auth';
import { useActions, removeUserDetails } from '../../actions';
//import { devConfig, betaConfig, localConfig, prodConfig, qaConfig } from '../../utils/config'
import { Text } from '../../common/Language';

const Logout = () => {
  //    const env = process.env.REACT_APP_STAGE;
  const removeUserData = useActions(removeUserDetails);
  // const removeAssessmentData = useActions(removeAssessmentDetails);
  let logout_url: string;
  const systemDetails = useSelector((state: IRootState) => state.systemDetails);
  logout_url = `https://${systemDetails.appClientURL}/logout?client_id=${systemDetails.appClientId}&logout_uri=https://${window.location.host}/`;

  // const redirectUrl = env === 'development' ? authUrl : authUrlQA;
  /*    if (env === 'Beta') {
            logout_url = betaConfig.logoutUrl
        } else if (env === 'Dev') {
            logout_url = devConfig.logoutUrl;
        } else if (env === 'qa') {
            logout_url = `${qaConfig.logoutUrl}&logout_uri=${window.location.protocol}//${window.location.host}/`;
    //        logout_url = qaConfig.logoutUrl;
        } else if (env === 'Prod') {
            logout_url = prodConfig.logoutUrl;
        } else {
            logout_url = localConfig.logoutUrl;
        }
    */
  // tslint:disable-next-line: max-line-length
  useEffect(() => {
    //        new AuthMethods().logOut();
    removeUserData();
    // removeAssessmentData();
    window.open(
      logout_url,
      '_self',
      `toolbar=no, location=no, directories=no, status=no, menubar=no,
        scrollbars=no, resizable=no, copyhistory=no, width=${500},
        height=${5000}, top=${300}, left=${300}`
    );
  });
  return (
    <div
      style={{
        marginTop: '150px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Text tid='loggedOut' />
    </div>
  );
};

export default Logout;
