import { toast } from 'react-toastify';

export const getAccount = async () => {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0]
    }
    toast.error("You need to have metamask installed")
    return false
}

export const handleSignMessage = async (publicAddress, nonce) => {
    try {
        const signature = await window.web3.eth.personal.sign(`I am signing my one-time nonce: ${nonce}`, publicAddress);
        return { publicAddress, signature };
    } catch (err) {
        throw new Error(
            'You need to sign the message to be able to log in.'
        );
    }
};

export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.addEventListener("load", function () {
            resolve(reader.result)
            reader = null;
        }, false);
        reader.addEventListener("error", function (error) {
            reject(error);
            reader = null;
        }, false);
        reader.readAsDataURL(file);
    });
}
export const jsonToFormdata = (values) => {
    const formdata = new FormData()
    Object.keys(values).forEach(key => {
        if (Array.isArray(values[key])) {
            formdata.append(key, JSON.stringify(values[key]))
        } else {
            formdata.append(key, values[key])
        }
    })
    return formdata
}