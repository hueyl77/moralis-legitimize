import Image from 'next/image';

const Loading = () => (
  <div style={{ textAlign: 'center' }}>
    <Image src={`/images/spinner.svg`} width={50} height={50} alt='Loading' />
  </div>
);

export default Loading;
