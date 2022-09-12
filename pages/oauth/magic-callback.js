import { useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router';
import { magic } from '../../lib/magic';
import { UserContext } from '../../lib/UserContext';
import Loading from '../../components/shared/Loading';

const MagicCallback = () => {

  const router = useRouter();
  // const [user, setUser] = useContext(UserContext);

  useEffect(() => {

    const authenticateWithServer = async (didToken, result) => {

      let res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + didToken,
        },
      });

      if (res.status === 200) {

        // Set the UserContext to the now logged in user
        let userMetadata = await magic.user.getMetadata();

        // await setUser(userMetadata);

        let socialHandle = "";
        let socialLinkName = "";

        if (result.oauth.provider == "twitter") {
          socialHandle = result.oauth.userInfo.preferredUsername;
          socialLinkName = result.oauth.userInfo.name;
        }
        else if (result.oauth.provider == "facebook") {
          socialHandle = result.oauth.userHandle;
          socialLinkName = result.oauth.userInfo.name;
        }
        else if (result.oauth.provider == "linkedin") {
          socialHandle = result.oauth.userHandle;
          socialLinkName = `${result.oauth.userInfo.givenName} ${result.oauth.userInfo.familyName}`;
        }

        const accessToken = result.oauth.accessToken;
        // we should save accesstoken temporarily in a database to check against

        window.opener.CallParentSocialLinkSuccess(socialHandle, socialLinkName);
        window.close();
        return;
      }

      // invalid didToken
      window.opener.CallParentSocialLinkFailed();
      window.close();
    };

    if (router.query.provider) {

      (async () => {
        let result = await magic.oauth.getRedirectResult();
        const didToken = result.magic.idToken;

        await authenticateWithServer(didToken, result);
      })();
    }

  }, [router.query]);

  return <>
    <Loading />
    <div className="mt-4 text-center">
      Verifying Identity...
    </div>
  </>;
};

export default MagicCallback;