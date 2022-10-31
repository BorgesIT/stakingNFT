import './App.css';
import { Button, ButtonGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import 'sf-font';
import axios from 'axios';
import ABI from './ABI.json';
import VAULTABI from './VAULTABI.json';
import TOKENABI from './TOKENABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, polygonscanapi, moralisapi, nftpng } from './config';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';

var account = null;
var contract = null;
var vaultcontract = null;
var web3 = null;

const Web3Alc = createAlchemyWeb3("https://polygon-mumbai.g.alchemy.com/v2/SSiEVUzdsQPOg1_El2qt66guzS3HKAqT");

const moralisapikey = "CidXWmWZATNTU0hTils3ieHjdhpPNDDSom9vy790EO2F3yyEP8yenUebVsXzwH71";
const polygonscanapikey = "52BFSRXTSQ8XJUX7Q1RFREZ1EBTNYMC6SP";

const providerOptions = {
	binancechainwallet: {
		package: true
	  },
	  walletconnect: {
		package: WalletConnectProvider,
		options: {
		  infuraId: "3cf2d8833a2143b795b7796087fff369"
		}
	},
	walletlink: {
		package: WalletLink, 
		options: {
		  appName: "Net2Dev NFT Minter", 
		  infuraId: "3cf2d8833a2143b795b7796087fff369",
		  rpc: "", 
		  chainId: 4, 
		  appLogoUrl: null, 
		  darkMode: true 
		}
	  },
};

const web3Modal = new Web3Modal({
	network: "mumbai",
	theme: "dark",
	cacheProvider: true,
	providerOptions 
  });

class App extends Component {
	constructor() {
		super();
		this.state = {
			balance: [],
			rawearn: [],
		};
	}
  
	handleModal(){  
		this.setState({show:!this.state.show})  
	} 

	handleNFT(nftamount) {
		this.setState({outvalue:nftamount.target.value});
  	}

	async componentDidMount() {
		
		await axios.get((polygonscanapi + `?module=stats&action=tokensupply&contractaddress=${NFTCONTRACT}&apikey=${polygonscanapikey}`))
		.then(outputa => {
            this.setState({
                balance:outputa.data
            })
            console.log(outputa.data)
        })
		let config = {'X-API-Key': moralisapikey, 'accept': 'application/json'};
		await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=mumbai&format=decimal`), {headers: config})
		.then(outputb => {
			const { result } = outputb.data
            this.setState({
                nftdata:result
            })
            console.log(outputb.data)
        })
	}


render() {
	const {balance} = this.state;
	const {outvalue} = this.state;
  

  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  const expectedBlockTime = 10000;

  async function connectwallet() {
    var provider = await web3Modal.connect();
    web3 = new Web3(provider);
    await provider.send('eth_requestAccounts');
    var accounts = await web3.eth.getAccounts();
    account = accounts[0];
    document.getElementById('wallet-address').textContent = account;
    contract = new web3.eth.Contract(ABI, NFTCONTRACT);
    vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
    var getstakednfts = await vaultcontract.methods.tokensOfOwner(account).call();
    document.getElementById('yournfts').textContent = getstakednfts;
    var getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
    document.getElementById('stakedbalance').textContent = getbalance;
    const arraynft = Array.from(getstakednfts.map(Number));
		const tokenid = arraynft.filter(Number);
		var rwdArray = [];
    tokenid.forEach(async (id) => {
      var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
      var array = Array.from(rawearn.map(Number));
      console.log(array);
      array.forEach(async (item) => {
        var earned = String(item).split(",")[0];
        var earnedrwd = Web3.utils.fromWei(earned);
        var rewardx = Number(earnedrwd).toFixed(2);
        var numrwd = Number(rewardx);
        console.log(numrwd);
        rwdArray.push(numrwd);
      });
    });
    function delay() {
      return new Promise(resolve => setTimeout(resolve, 300));
    }
    async function delayedLog(item) {
      await delay();
      var sum = item.reduce((a, b) => a + b, 0);
      var formatsum = Number(sum).toFixed(2);
      document.getElementById('earned').textContent = formatsum;
    }
    async function processArray(rwdArray) {
      for (const item of rwdArray) {
        await delayedLog(item);
      }
    }
    return processArray([rwdArray]);
  }

  async function verify() {
    var getstakednfts = await vaultcontract.methods.tokensOfOwner(account).call();
    document.getElementById('yournfts').textContent = getstakednfts;
    var getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
    document.getElementById('stakedbalance').textContent = getbalance;
  }

  async function enable() {
    contract.methods.setApprovalForAll(STAKINGCONTRACT, true).send({ from: account });
  }
  async function rewardinfo() {
    var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
    const arraynft = Array.from(rawnfts.map(Number));
    const tokenid = arraynft.filter(Number);
    var rwdArray = [];
    tokenid.forEach(async (id) => {
      var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
      var array = Array.from(rawearn.map(Number));
      array.forEach(async (item) => {
        var earned = String(item).split(",")[0];
        var earnedrwd = Web3.utils.fromWei(earned);
        var rewardx = Number(earnedrwd).toFixed(2);
        var numrwd = Number(rewardx);
        rwdArray.push(numrwd)
      });
    });
    function delay() {
      return new Promise(resolve => setTimeout(resolve, 300));
    }
    async function delayedLog(item) {
      await delay();
      var sum = item.reduce((a, b) => a + b, 0);
      var formatsum = Number(sum).toFixed(2);
      document.getElementById('earned').textContent = formatsum;
    }
    async function processArray(rwdArray) {
      for (const item of rwdArray) {
        await delayedLog(item);
      }
    }
    return processArray([rwdArray]);
  }

  async function claimit() {
    var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
    const arraynft = Array.from(rawnfts.map(Number));
    const tokenid = arraynft.filter(Number);
    await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
      Web3Alc.eth.getBlock('pending').then((block) => {
        var baseFee = Number(block.baseFeePerGas);
        var maxPriority = Number(tip);
        var maxFee = maxPriority + baseFee;
        tokenid.forEach(async (id) => {
          await vaultcontract.methods.claim([id])
            .send({
              from: account,
              maxFeePerGas: maxFee,
              maxPriorityFeePerGas: maxPriority
            })
        })
      });
    })
  }

  async function unstakeall() {
    var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
    const arraynft = Array.from(rawnfts.map(Number));
    const tokenid = arraynft.filter(Number);
    await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
      Web3Alc.eth.getBlock('pending').then((block) => {
        var baseFee = Number(block.baseFeePerGas);
        var maxPriority = Number(tip);
        var maxFee = maxPriority + baseFee;
        tokenid.forEach(async (id) => {
          await vaultcontract.methods.unstake([id])
            .send({
              from: account,
              maxFeePerGas: maxFee,
              maxPriorityFeePerGas: maxPriority
            })
        })
      });
    })
  }
  
const refreshPage = ()=>{
  window.location.reload();  
}

  return (
    <div className="App nftapp">
        <nav class="navbar navbarfont navbarglow navbar-expand-md navbar-dark bg-dark mb-4">
          <div class="container-fluid">
            <a class="navbar-brand px-5" style={{ fontWeight: "800", fontSize: '25px' }} href="#"></a><img src="logo.png" width="30%" />
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
              
            </div>
          </div>
          <div className='px-5'>
            <input id="connectbtn" type="button" className="connectbutton" onClick={connectwallet} style={{ fontWeight: "700" }} value="Connect Your Wallet" />
          </div>
        </nav>
        <div className='container'>
          <body className='nftstaker '>
            <form>
              <h2 style={{ borderRadius: '14px', fontWeight: "800", fontSize: "28px" }}>BTWR NFT Staking Vault </h2>
              <h6 style={{fontWeight: "700", fontSize: "20px"}}> TU WALLET</h6>
              <div className="pb-3" id='wallet-address' style={{
                color: "#39FF14",
                fontWeight: "400",
                textShadow: "1px 1px 1px black",
              }}>
                <label for="floatingInput" style={{ fontWeight: "700" }}>Por favor conecta tu Wallet</label>
              </div>
              <h6 style={{ fontWeight: "700" }}>¿Primera vez haciendo Staking?</h6>
              <Button className="btn" onClick={enable} style={{ backgroundColor: "#029edf", boxShadow: "1px 1px 5px #000000", marginBottom: "7px" }} >Autoriza tu Wallet</Button>
              <div className="row px-3">
                <div className="col">
                  <form class="stakingrewards" style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #ca22fe" }}>
                    <h5 style={{ color: "#FFFFFF", fontWeight: '500' }}>Tu Activitidad</h5>
                    <h6 style={{ color: "#FFFFFF" }}>Verifica tus NFTs en Staking</h6>
                    <Button onClick={verify} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000"}} >Verificar</Button>
                    <table className='table mt-3 mb-5 px-3 table-dark' style={{ fontWeight: "700" }}>
                      <tr>
                        <td style={{ fontSize: "19px" }}>NFTs en Staking ID:
                          <span style={{ backgroundColor: "#ffffff00", fontSize: "21px", color: "#39FF14", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='yournfts'></span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "19px" }}>Total de NFTs:
                          <span style={{ backgroundColor: "#ffffff00", fontSize: "21px", color: "#39FF14", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='stakedbalance'></span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "19px" }}>Unstake todos los NFT
                          <Button onClick={unstakeall} className='mb-3' style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }}> Unstake All</Button>
                        </td>
                      </tr>
                    </table>
                  </form>
                </div>
                  <img className="col-lg-4" src="Logo-03.png"/>
                  <div className="col">
                    <form className='stakingrewards' style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #ca22fe", fontFamily: "SF Pro Display", fontWeight: "700" }}>
                      <h5 style={{ color: "#FFFFFF", fontWeight: '700' }}> Recompensas</h5>
                      <Button onClick={rewardinfo} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >BITK2COIN GANADOS</Button>
                      <div id='earned' style={{ color: "#39FF14", marginTop: "5px", fontSize: '25px', fontWeight: '500', textShadow: "1px 1px 2px #000000" }}><p style={{ fontSize: "20px" }}>Tokens ganados</p></div>
                      <div className='col-12 mt-2'>
                        <div style={{ color: 'white' }}>Reclama tus recompensas</div>
                        <Button onClick={claimit} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} className="mb-2">Reclamar</Button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="row px-4 pt-2">
                  <div class="header">
                    <div style={{ fontSize: '25px', borderRadius: '14px', color: "#ffffff", fontWeight: "700" }}>Ejemplos de Recompensas</div>
                    <table className='table px-3 table-bordered table-dark'>
                      <thead className='thead-light' style={{ fontWeight: "700" }}>
                        <tr>
                          <th scope="col">Cantidad de NFT</th>
                          <th scope="col">Recompensas Por día</th>
                          <th scope="col">Recompensas al mes</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontWeight: "500" }}>
                        <tr>
                          <td>1 NFT</td>
                          <td class="amount" data-test-id="rewards-summary-ads">
                            <span class="amount">1.5</span>&nbsp;<span class="currency">BITK2COIN / DIA</span>
                          </td>
                          <td class="exchange">
                            <span class="amount">45</span>&nbsp;<span class="currency">BITK2COIN / MES</span>
                          </td>
                        </tr>
                        <tr>
                          <td>5 NFT</td>
                          <td class="amount" data-test-id="rewards-summary-ac">
                            <span class="amount">7.5</span>&nbsp;<span class="currency">BITK2COIN / DÍA</span>
                          </td>
                          <td class="exchange"><span class="amount">225</span>&nbsp;<span class="currency">BITK2COIN / MES</span>
                          </td>
                        </tr>
                        <tr className='stakegoldeffect'>
                          <td>10 NFT</td>
                          <td class="amount" data-test-id="rewards-summary-one-time"><span class="amount">15</span>&nbsp;<span class="currency">BITK2COIN / DÍA</span>
                          </td>
                          <td class="exchange">
                            <span class="amount">450 </span>
                            <span class="currency">BITK2COIN / MES</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                  </div>
                </div>
            </form>
          </body>
        
      </div>
      <div className='container'>
      <div className='row nftportal mt-3'>
        <div className='col mt-4 ml-3'>
        <img src="polygon.png" width={'60%'}></img>
      </div>
      <div className='col'>
        <h1 className='n2dtitlestyle mt-3' style={{ fontWeight: "700" }}>TU PORTAL NFT</h1>
      <Button onClick={refreshPage} style={{ backgroundColor: "#000000", boxShadow: "1px 1px 5px #000000" }}>Refresh NFT Portal</Button>
      </div>
      <div className='col mt-3 mr-5'>
      <img src="ethereum.png" width={'60%'}></img>
      </div>
      </div>
      </div>
      </div>
    )
  }
}
export default App;