/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../common";
import type { TestNFT, TestNFTInterface } from "../../contracts/TestNFT";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "string",
        name: "uri",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_SUPPLY",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastMintedTokenId",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040526000600760006101000a8154816fffffffffffffffffffffffffffffffff02191690836fffffffffffffffffffffffffffffffff1602179055503480156200004b57600080fd5b506040516200264938038062002649833981810160405281019062000071919062000247565b828281600090816200008491906200054b565b5080600190816200009691906200054b565b5050508060069081620000aa91906200054b565b5050505062000632565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6200011d82620000d2565b810181811067ffffffffffffffff821117156200013f576200013e620000e3565b5b80604052505050565b600062000154620000b4565b905062000162828262000112565b919050565b600067ffffffffffffffff821115620001855762000184620000e3565b5b6200019082620000d2565b9050602081019050919050565b60005b83811015620001bd578082015181840152602081019050620001a0565b60008484015250505050565b6000620001e0620001da8462000167565b62000148565b905082815260208101848484011115620001ff57620001fe620000cd565b5b6200020c8482856200019d565b509392505050565b600082601f8301126200022c576200022b620000c8565b5b81516200023e848260208601620001c9565b91505092915050565b600080600060608486031215620002635762000262620000be565b5b600084015167ffffffffffffffff811115620002845762000283620000c3565b5b620002928682870162000214565b935050602084015167ffffffffffffffff811115620002b657620002b5620000c3565b5b620002c48682870162000214565b925050604084015167ffffffffffffffff811115620002e857620002e7620000c3565b5b620002f68682870162000214565b9150509250925092565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200035357607f821691505b6020821081036200036957620003686200030b565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b600060088302620003d37fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8262000394565b620003df868362000394565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006200042c620004266200042084620003f7565b62000401565b620003f7565b9050919050565b6000819050919050565b62000448836200040b565b62000460620004578262000433565b848454620003a1565b825550505050565b600090565b6200047762000468565b620004848184846200043d565b505050565b5b81811015620004ac57620004a06000826200046d565b6001810190506200048a565b5050565b601f821115620004fb57620004c5816200036f565b620004d08462000384565b81016020851015620004e0578190505b620004f8620004ef8562000384565b83018262000489565b50505b505050565b600082821c905092915050565b6000620005206000198460080262000500565b1980831691505092915050565b60006200053b83836200050d565b9150826002028217905092915050565b620005568262000300565b67ffffffffffffffff811115620005725762000571620000e3565b5b6200057e82546200033a565b6200058b828285620004b0565b600060209050601f831160018114620005c35760008415620005ae578287015190505b620005ba85826200052d565b8655506200062a565b601f198416620005d3866200036f565b60005b82811015620005fd57848901518255600182019150602085019450602081019050620005d6565b868310156200061d578489015162000619601f8916826200050d565b8355505b6001600288020188555050505b505050505050565b61200780620006426000396000f3fe608060405234801561001057600080fd5b50600436106101005760003560e01c80636352211e11610097578063a22cb46511610066578063a22cb465146102ad578063b88d4fde146102c9578063c87b56dd146102e5578063e985e9c51461031557610100565b80636352211e146102115780636508b10a1461024157806370a082311461025f57806395d89b411461028f57610100565b806323b872dd116100d357806323b872dd1461019f57806332cb6b0c146101bb57806340c10f19146101d957806342842e0e146101f557610100565b806301ffc9a71461010557806306fdde0314610135578063081812fc14610153578063095ea7b314610183575b600080fd5b61011f600480360381019061011a9190611511565b610345565b60405161012c9190611559565b60405180910390f35b61013d6103d7565b60405161014a9190611604565b60405180910390f35b61016d6004803603810190610168919061165c565b610465565b60405161017a91906116ca565b60405180910390f35b61019d60048036038101906101989190611711565b610498565b005b6101b960048036038101906101b49190611751565b610681565b005b6101c3610a80565b6040516101d091906117cf565b60405180910390f35b6101f360048036038101906101ee9190611711565b610a86565b005b61020f600480360381019061020a9190611751565b610a94565b005b61022b6004803603810190610226919061165c565b610bcc565b60405161023891906116ca565b60405180910390f35b610249610c77565b60405161025691906117cf565b60405180910390f35b610279600480360381019061027491906117ea565b610c99565b6040516102869190611826565b60405180910390f35b610297610d50565b6040516102a49190611604565b60405180910390f35b6102c760048036038101906102c2919061186d565b610dde565b005b6102e360048036038101906102de9190611912565b610edb565b005b6102ff60048036038101906102fa919061165c565b611019565b60405161030c9190611604565b60405180910390f35b61032f600480360381019061032a919061199a565b61104d565b60405161033c9190611559565b60405180910390f35b60006301ffc9a760e01b827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614806103a057506380ac58cd60e01b827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b806103d05750635b5e139f60e01b827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b9050919050565b600080546103e490611a09565b80601f016020809104026020016040519081016040528092919081815260200182805461041090611a09565b801561045d5780601f106104325761010080835404028352916020019161045d565b820191906000526020600020905b81548152906001019060200180831161044057829003601f168201915b505050505081565b60046020528060005260406000206000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60006002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614806105905750600560008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b6105cf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105c690611a86565b60405180910390fd5b826004600084815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550818373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a4505050565b6002600082815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614610722576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161071990611af2565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610791576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078890611b5e565b60405180910390fd5b8273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614806108515750600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff165b806108ba57506004600082815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b6108f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108f090611a86565b60405180910390fd5b600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000815480929190600190039190505550600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008154809291906001019190505550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506004600082815260200190815260200160002060006101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b61271081565b610a90828261107c565b5050565b610a9f838383610681565b60008273ffffffffffffffffffffffffffffffffffffffff163b1480610b88575063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168273ffffffffffffffffffffffffffffffffffffffff1663150b7a023386856040518463ffffffff1660e01b8152600401610b2493929190611bb5565b6020604051808303816000875af1158015610b43573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b679190611c14565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b610bc7576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bbe90611c8d565b60405180910390fd5b505050565b60008073ffffffffffffffffffffffffffffffffffffffff166002600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1691508173ffffffffffffffffffffffffffffffffffffffff1603610c72576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c6990611cf9565b60405180910390fd5b919050565b600760009054906101000a90046fffffffffffffffffffffffffffffffff1681565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610d09576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0090611d65565b60405180910390fd5b600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b60018054610d5d90611a09565b80601f0160208091040260200160405190810160405280929190818152602001828054610d8990611a09565b8015610dd65780601f10610dab57610100808354040283529160200191610dd6565b820191906000526020600020905b815481529060010190602001808311610db957829003601f168201915b505050505081565b80600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051610ecf9190611559565b60405180910390a35050565b610ee6858585610681565b60008473ffffffffffffffffffffffffffffffffffffffff163b1480610fd3575063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168473ffffffffffffffffffffffffffffffffffffffff1663150b7a0233888787876040518663ffffffff1660e01b8152600401610f6f959493929190611dc1565b6020604051808303816000875af1158015610f8e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610fb29190611c14565b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b611012576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161100990611c8d565b60405180910390fd5b5050505050565b606060066110268361128e565b604051602001611037929190611ee3565b6040516020818303038152906040529050919050565b60056020528160005260406000206020528060005260406000206000915091509054906101000a900460ff1681565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036110eb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110e290611b5e565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff166002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461118d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161118490611f53565b60405180910390fd5b600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008154809291906001019190505550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b60606000600161129d8461135c565b01905060008167ffffffffffffffff8111156112bc576112bb611f73565b5b6040519080825280601f01601f1916602001820160405280156112ee5781602001600182028036833780820191505090505b509050600082602001820190505b600115611351578080600190039150507f3031323334353637383961626364656600000000000000000000000000000000600a86061a8153600a858161134557611344611fa2565b5b049450600085036112fc575b819350505050919050565b600080600090507a184f03e93ff9f4daa797ed6e38ed64bf6a1f01000000000000000083106113ba577a184f03e93ff9f4daa797ed6e38ed64bf6a1f01000000000000000083816113b0576113af611fa2565b5b0492506040810190505b6d04ee2d6d415b85acef810000000083106113f7576d04ee2d6d415b85acef810000000083816113ed576113ec611fa2565b5b0492506020810190505b662386f26fc10000831061142657662386f26fc10000838161141c5761141b611fa2565b5b0492506010810190505b6305f5e100831061144f576305f5e100838161144557611444611fa2565b5b0492506008810190505b612710831061147457612710838161146a57611469611fa2565b5b0492506004810190505b60648310611497576064838161148d5761148c611fa2565b5b0492506002810190505b600a83106114a6576001810190505b80915050919050565b600080fd5b600080fd5b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b6114ee816114b9565b81146114f957600080fd5b50565b60008135905061150b816114e5565b92915050565b600060208284031215611527576115266114af565b5b6000611535848285016114fc565b91505092915050565b60008115159050919050565b6115538161153e565b82525050565b600060208201905061156e600083018461154a565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156115ae578082015181840152602081019050611593565b60008484015250505050565b6000601f19601f8301169050919050565b60006115d682611574565b6115e0818561157f565b93506115f0818560208601611590565b6115f9816115ba565b840191505092915050565b6000602082019050818103600083015261161e81846115cb565b905092915050565b6000819050919050565b61163981611626565b811461164457600080fd5b50565b60008135905061165681611630565b92915050565b600060208284031215611672576116716114af565b5b600061168084828501611647565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006116b482611689565b9050919050565b6116c4816116a9565b82525050565b60006020820190506116df60008301846116bb565b92915050565b6116ee816116a9565b81146116f957600080fd5b50565b60008135905061170b816116e5565b92915050565b60008060408385031215611728576117276114af565b5b6000611736858286016116fc565b925050602061174785828601611647565b9150509250929050565b60008060006060848603121561176a576117696114af565b5b6000611778868287016116fc565b9350506020611789868287016116fc565b925050604061179a86828701611647565b9150509250925092565b60006fffffffffffffffffffffffffffffffff82169050919050565b6117c9816117a4565b82525050565b60006020820190506117e460008301846117c0565b92915050565b600060208284031215611800576117ff6114af565b5b600061180e848285016116fc565b91505092915050565b61182081611626565b82525050565b600060208201905061183b6000830184611817565b92915050565b61184a8161153e565b811461185557600080fd5b50565b60008135905061186781611841565b92915050565b60008060408385031215611884576118836114af565b5b6000611892858286016116fc565b92505060206118a385828601611858565b9150509250929050565b600080fd5b600080fd5b600080fd5b60008083601f8401126118d2576118d16118ad565b5b8235905067ffffffffffffffff8111156118ef576118ee6118b2565b5b60208301915083600182028301111561190b5761190a6118b7565b5b9250929050565b60008060008060006080868803121561192e5761192d6114af565b5b600061193c888289016116fc565b955050602061194d888289016116fc565b945050604061195e88828901611647565b935050606086013567ffffffffffffffff81111561197f5761197e6114b4565b5b61198b888289016118bc565b92509250509295509295909350565b600080604083850312156119b1576119b06114af565b5b60006119bf858286016116fc565b92505060206119d0858286016116fc565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b60006002820490506001821680611a2157607f821691505b602082108103611a3457611a336119da565b5b50919050565b7f4e4f545f415554484f52495a4544000000000000000000000000000000000000600082015250565b6000611a70600e8361157f565b9150611a7b82611a3a565b602082019050919050565b60006020820190508181036000830152611a9f81611a63565b9050919050565b7f57524f4e475f46524f4d00000000000000000000000000000000000000000000600082015250565b6000611adc600a8361157f565b9150611ae782611aa6565b602082019050919050565b60006020820190508181036000830152611b0b81611acf565b9050919050565b7f494e56414c49445f524543495049454e54000000000000000000000000000000600082015250565b6000611b4860118361157f565b9150611b5382611b12565b602082019050919050565b60006020820190508181036000830152611b7781611b3b565b9050919050565b600082825260208201905092915050565b50565b6000611b9f600083611b7e565b9150611baa82611b8f565b600082019050919050565b6000608082019050611bca60008301866116bb565b611bd760208301856116bb565b611be46040830184611817565b8181036060830152611bf581611b92565b9050949350505050565b600081519050611c0e816114e5565b92915050565b600060208284031215611c2a57611c296114af565b5b6000611c3884828501611bff565b91505092915050565b7f554e534146455f524543495049454e5400000000000000000000000000000000600082015250565b6000611c7760108361157f565b9150611c8282611c41565b602082019050919050565b60006020820190508181036000830152611ca681611c6a565b9050919050565b7f4e4f545f4d494e54454400000000000000000000000000000000000000000000600082015250565b6000611ce3600a8361157f565b9150611cee82611cad565b602082019050919050565b60006020820190508181036000830152611d1281611cd6565b9050919050565b7f5a45524f5f414444524553530000000000000000000000000000000000000000600082015250565b6000611d4f600c8361157f565b9150611d5a82611d19565b602082019050919050565b60006020820190508181036000830152611d7e81611d42565b9050919050565b82818337600083830152505050565b6000611da08385611b7e565b9350611dad838584611d85565b611db6836115ba565b840190509392505050565b6000608082019050611dd660008301886116bb565b611de360208301876116bb565b611df06040830186611817565b8181036060830152611e03818486611d94565b90509695505050505050565b600081905092915050565b60008190508160005260206000209050919050565b60008154611e3c81611a09565b611e468186611e0f565b94506001821660008114611e615760018114611e7657611ea9565b60ff1983168652811515820286019350611ea9565b611e7f85611e1a565b60005b83811015611ea157815481890152600182019150602081019050611e82565b838801955050505b50505092915050565b6000611ebd82611574565b611ec78185611e0f565b9350611ed7818560208601611590565b80840191505092915050565b6000611eef8285611e2f565b9150611efb8284611eb2565b91508190509392505050565b7f414c52454144595f4d494e544544000000000000000000000000000000000000600082015250565b6000611f3d600e8361157f565b9150611f4882611f07565b602082019050919050565b60006020820190508181036000830152611f6c81611f30565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fdfea26469706673582212202a2938448e62f06ca95b5e945f7a97c332591ead399758ff7756a8bcc3e1476964736f6c63430008120033";

type TestNFTConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestNFTConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestNFT__factory extends ContractFactory {
  constructor(...args: TestNFTConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    name: string,
    symbol: string,
    uri: string,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(name, symbol, uri, overrides || {});
  }
  override deploy(
    name: string,
    symbol: string,
    uri: string,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(name, symbol, uri, overrides || {}) as Promise<
      TestNFT & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): TestNFT__factory {
    return super.connect(runner) as TestNFT__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestNFTInterface {
    return new Interface(_abi) as TestNFTInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): TestNFT {
    return new Contract(address, _abi, runner) as unknown as TestNFT;
  }
}
