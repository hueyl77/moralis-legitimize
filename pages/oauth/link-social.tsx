import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { magic } from '../../lib/magic';
import { OAuthProvider } from '@magic-ext/oauth';

export default function Page() {

  const router = useRouter();


  useEffect(() => {

    const { socialType } = router.query;
    if (!socialType) {
      return;
    }

    (async () => {
      const result = await magic.oauth.loginWithRedirect({
        provider: socialType as OAuthProvider,
        // redirectURI: `http://localhost:3000/oauth/${socialType}/callback`,
        redirectURI: `${process.env.NEXT_PUBLIC_LEGIT_BASE_URL}/oauth/magic-callback`,
        // scope: ['user:email'], /* optional */
      });
    })();

  }, [router.query]);

  return (
    <div className="grid grid-cols-3 gap-2">

    </div>
  );
}


// const OAuthRedir = ({ onClose, socialType }: Props) => {
//   return (
//       <div style={{
//         width: "50%",
//         height: "50%",
//         padding: "50px",
//         background: "white",
//         position: "absolute",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         borderRadius: "8px",
//         zIndex: 1000
//       }}>
//       </div>
//   );
// };

// export default OAuthRedir;
