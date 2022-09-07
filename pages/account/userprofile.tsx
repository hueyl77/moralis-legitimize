import { useRouter } from "next/router";

import { useContext } from 'react';
import { UserContext } from '../../lib/UserContext';
import Loading from '../../components/shared/Loading';

import MainLayout from '../../components/layouts/MainLayout'
import PageIllustration from '../../components/shared/PageIllustration'


export default function Page() {
  const router = useRouter();

  const [user] = useContext(UserContext);

  return (
    <>
      {user?.loading ? (
        <Loading />
      ) : (
        user?.issuer && (
          <>
            <div className='label'>Email</div>
            <div className='profile-info'>{user.email}</div>

            <div className='label'>User Id</div>
            <div className='profile-info'>{user.issuer}</div>
          </>
        )
      )}
      <style jsx>{`
        .label {
          font-size: 12px;
          color: #6851ff;
          margin: 30px 0 5px;
        }
        .profile-info {
          font-size: 17px;
          word-wrap: break-word;
        }
      `}</style>
    </>
  );

};

export async function getServerSideProps(context) {

  const data = {  };

  return { props: { data } }
}

Page.getLayout = function getLayout(page) {
  return (
    <MainLayout>
      {page}
    </MainLayout>
  )
}