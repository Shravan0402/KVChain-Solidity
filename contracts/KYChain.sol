// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract KYChain{

    enum status{PENDING, DONE, FAILED}

    struct KYCdata{
        uint256 idno;
        string photo;
        string name;
        uint256 dob;
        address walletAddress;
        address inspectorAddress;
        uint256 phno;
        string email;
        address[] accessData;
        status KYCStatus;
    }

    KYCdata[] data;

    function newApplication(uint256 _idno, string memory _photo, string memory _name, address _inspectorAddress, uint256 _dob, uint256 _phno, string memory _email) public returns(uint256){
        address[] memory _accessData;
        data.push(KYCdata(_idno, _photo, _name, _dob, msg.sender, _inspectorAddress, _phno, _email, _accessData, status.PENDING));
        return data.length-1;
    }

    function reviewApplication(uint256 _index, status _applicationReview) public {
        require(data[_index].inspectorAddress == msg.sender, "Only the inspector can review the application");
        require(data[_index].KYCStatus==status.PENDING, "You can only update review once");
        data[_index].KYCStatus = _applicationReview;
    }

    function addAccessers(uint256 _index, address _accesserAddress) public{
        require(msg.sender == data[_index].walletAddress, "Only the KYC creator can add the accesor's list");
        require(data[_index].KYCStatus!=status.PENDING, "Let the inspector check the application before adding accesor's list");
        require(data[_index].KYCStatus!=status.FAILED, "The KYC verification has failed");
        data[_index].accessData.push(_accesserAddress);
    }

    function getKYC(uint256 _index) public view returns(KYCdata memory){
        uint256 count = 0;
        for(uint256 i=0; i<data[_index].accessData.length; i++){
            if(data[_index].accessData[i] == msg.sender){
                count++;
                break;
            }
        }
        require(count==1, "You are not a verified partner to get the customer KYC");
        return (data[_index]);
    }

}