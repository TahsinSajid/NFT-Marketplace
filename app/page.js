"use client"
import { useEffect, useState } from "react";
import Header from "./Components/Header";
import { ethers } from "ethers";
import contractabi from "./abi/abi.json"
const axios = require('axios')
const FormData = require('form-data')



export default function Home() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(0);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [description,setDescription] = useState("");
  const [image, setImage] = useState(null);  
  useEffect(()=>{
    async function initialize(){
      if(typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        setAddress(address);
        // setBalance(ethers.utils.parseEther(balance));
        const mycontractaddress="0x8ba47490BD0E3e94fA8ED7b3a999E254beA97DD8";
        const contract = new ethers.Contract(mycontractaddress,contractabi,signer)
        setContract(contract)
      }
    }
    initialize();
  },[])

  function onChangeFile(e){
    const file = e.target.files[0];
    setImage(file);
    console.log(file)
  }

 async function onSubmit(event){
    if(!name && !description && !image){
      alert("Fill the required details")
      return;
    } 
    const JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiYzA1M2VhNy02NDRlLTQzYTUtYjJiMS1hMTQyZmZjNzM1ZDgiLCJlbWFpbCI6InRhaHNpbi5zYWppZEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYTJlZTVkNjgwNGNmZTNhMTQyYjMiLCJzY29wZWRLZXlTZWNyZXQiOiI5MDk2MjZiYjMzMzM3ZTczODdhNjg0OWZlMDQ4Mzc0OWUwN2I0NzRkYWVjNWFmNGM1ZmFjMGExOTU5NmEwNjY0IiwiaWF0IjoxNjk0MjUwMjIwfQ.8ZLVuE4R65ggS1jxxkKoehZd6hUDXjOciMm_YvLOAWk";
    event.preventDefault();

    const formData = new FormData();
    formData.append('file', image);

    const pinataMetadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: "Bearer " + JWT,
        }
      });
      console.log(res.data);
      const ipfshash=res.data.IpfsHash;
      console.log(ipfshash);
      const jsonic={
        "name":name,
        "description":description,
        "image":`ipfs/${ipfshash}`
      }
      const resjson = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonic, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: "Bearer " + JWT,
        }
      })
      const jsonHash=resjson.data.Ipfshash;
      const tokenURI=`https://ipfs.io/ipfs/${jsonHash}`;
      const conc=contract?.mintNFT(address,tokenURI);
      console.log("mytokenId",conc);
    } 
    catch (error) {
      console.error(error);
    }


  }
  return (
    <>
    <div>
   <Header/>
   <div className="text-center">
   <p className="text-md text-blue-400 lg:text-3xl">Hi, {address?.slice(0,10)}...{address?.slice(-10)} </p>
   <div className="flex bg-yellow-400 px-10 mt-5 flex-col space-y-4 py-10 rounded-xl md:mx-[200px] lg:mx-[800px]">
   <p>NFT MarketPlace</p>
   <input type="text" placeholder="Enter your name" value={name} onChange={(e)=>{setName(e.target.value)}} className="border border-black px-2 " />
   <input type="text" placeholder="Enter your description" value={description} onChange={(e)=>{setDescription(e.target.value)}} className="border border-black px-2 " />
   <div>
   <label>Upload Image</label>
   <input type="file" className="mt-2" accept="image/*"  onChange={onChangeFile} />
   <button className="bg-blue-400 px-4 py-2 rounded-lg mt-4" onClick={onSubmit} >Submit</button>
   </div>
   </div>
  </div>
    </div>
    </>
  )
}