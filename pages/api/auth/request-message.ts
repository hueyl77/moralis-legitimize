import Moralis from 'moralis';

const config = {
    domain: process.env.APP_DOMAIN,
    statement: 'Please sign this message to confirm your identity.',
    uri: process.env.NEXTAUTH_URL,
    timeout: 60,
};

export default async function handler(req, res) {
    const { address, chain, network } = req.body;
console.log("MORALIS_API_KEY: ", process.env.MORALIS_API_KEY);

    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
console.log("HERE 2");

const message = await Moralis.Auth.requestMessage({
            address,
            chain,
            network,
            ...config,
        });

        res.status(200).json(message);


}