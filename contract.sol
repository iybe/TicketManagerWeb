// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TicketContract {

    struct Ticket {
        uint256 id;
        uint256 eventId;
        string  eventName;
        address owner;
        address organizer;
        uint256 age;
        uint256 limit;
        uint256 value;
        bool sale;
    }

    struct GroupTickets {
        uint256 eventId;
        string eventName;
        address organizer;
        uint256 value;
        uint256 quantity;
    }

    Ticket[] public tickets;

    uint256 private countEvent;
    uint256 private taxTransfer = 140000000000000;
    uint16  private maxQuantityTicketCreated = 1000;

    constructor() {
        countEvent = 1;
    }

    function createTickets(string memory _eventName, uint256 _limit, uint256 _value, uint16 _quantity) public {
        if (bytes(_eventName).length == 0) {
            revert("Event name is required");
        }

        if (!(_quantity > 0 && _quantity <= maxQuantityTicketCreated)) {
            revert(string(abi.encodePacked("Quantity must be between 1 and ", maxQuantityTicketCreated)));
        }

        if (_value < taxTransfer) {
            revert(string(abi.encodePacked("Value cannot be less than ", taxTransfer, " wei")));
        }

        uint256 newEventId = countEvent;
        countEvent++;

        uint256 newId = tickets.length + 1;

        for (uint16 i = 0; i < _quantity; i++) {
            Ticket memory newTicket = Ticket(newId, newEventId, _eventName, msg.sender, msg.sender, 0, _limit, _value, true);
            tickets.push(newTicket);
            newId++;
        }
    }

    function buyTicket(uint256 _eventId, address _owner, bool _sale) public payable returns (uint256) {
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].eventId == _eventId && tickets[i].owner == _owner && tickets[i].age < tickets[i].limit && tickets[i].sale) {
                if (msg.value < tickets[i].value) {
                    revert("Insufficient payment sent.");
                }

                address payable seller = payable(tickets[i].owner);
                seller.transfer(tickets[i].value - taxTransfer);
                
                tickets[i].age++;
                tickets[i].owner = msg.sender;
                tickets[i].sale = _sale;

                return tickets[i].id;
            }
        }
        revert("Tickets not available");
    }

    function changeSaleStatus(uint256 _id, bool _sale) public {
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].id == _id) {
                if (tickets[i].owner != msg.sender) {
                    revert("You are not the owner of this ticket.");
                }
                tickets[i].sale = _sale;
                return;
            }
        }
        revert("Tickets not found");
    }

    function filterTicketsByOwner(uint256 _eventId, address _owner, bool transferable, bool _sale) public view returns (Ticket[] memory) {
        if (_owner == address(0)) {
            revert("Owner address is required.");
        }
        
        Ticket[] memory filteredTickets = new Ticket[](tickets.length);
        uint256 numberTickets = 0;

        bool byEventId = _eventId != 0;

        for (uint256 i = 0; i < tickets.length; i++) {
            if (byEventId) {
                if (tickets[i].eventId != _eventId) {
                    continue;
                }
            }
            if (tickets[i].owner != _owner) {
                continue;
            }
            if (tickets[i].sale != _sale) {
                continue;
            }

            if (transferable) {
                if (tickets[i].age == tickets[i].limit) {
                    continue;
                }
            }

            filteredTickets[numberTickets] = tickets[i];
            numberTickets++;
        }

        assembly {
            mstore(filteredTickets, numberTickets)
        }

        return filteredTickets;
    }

    function filterTicketsByOrganizer(uint256 _eventId, address _organizer, bool transferable, bool _sale) public view returns (Ticket[] memory) {
        if (_organizer == address(0)) {
            revert("Organizer address is required.");
        }
        
        Ticket[] memory filteredTickets = new Ticket[](tickets.length);
        uint256 numberTickets = 0;

        bool byEventId = _eventId != 0;

        for (uint256 i = 0; i < tickets.length; i++) {
            if (byEventId) {
                if (tickets[i].eventId != _eventId) {
                    continue;
                }
            }
            if (tickets[i].organizer != _organizer) {
                continue;
            }

            if (tickets[i].sale != _sale) {
                continue;
            }

            if (transferable) {
                if (tickets[i].age == tickets[i].limit) {
                    continue;
                }
            }

            filteredTickets[numberTickets] = tickets[i];
            numberTickets++;
        }

        assembly {
            mstore(filteredTickets, numberTickets)
        }

        return filteredTickets;
    }

    function getGroupTickets() public view returns (GroupTickets[] memory) {
        GroupTickets[] memory groupTickets = new GroupTickets[](tickets.length);
        uint256 numberGroupTickets = 0;
        
        for (uint256 i = 0; i < tickets.length; i++) {
            if(!(tickets[i].age < tickets[i].limit && tickets[i].owner == tickets[i].organizer)) {
                continue;
            }
            
            bool exist = false;
            for (uint256 j = 0; j < groupTickets.length; j++) {
                if (groupTickets[j].eventId == tickets[i].eventId) {
                    exist = true;
                    groupTickets[j].quantity++;
                    break;
                }
            }

            if (!exist) {
                GroupTickets memory newGroupTicket = GroupTickets(tickets[i].eventId, tickets[i].eventName, tickets[i].organizer, tickets[i].value, 1);
                groupTickets[numberGroupTickets] = newGroupTicket;
                numberGroupTickets++;
            }
        }

        assembly {
            mstore(groupTickets, numberGroupTickets)
        }

        return groupTickets;
    }

    function filterTickets(uint256 _eventId, address _owner, address _organizer, uint256 _age, uint256 _limit) public view returns (Ticket[] memory) {
        Ticket[] memory filteredTickets = new Ticket[](tickets.length);
        uint256 numberTickets = 0;

        bool byEventId = _eventId != 0;
        bool byOwner = _owner != address(0);
        bool byOrganizer = _organizer != address(0);
        bool byAge = _age > 0;
        bool byLimit = _limit > 0;

        for (uint256 i = 0; i < tickets.length; i++) {
            if (byEventId) {
                if (tickets[i].eventId != _eventId) {
                    continue;
                }
            }
            if (byOwner) {
                if (tickets[i].owner != _owner) {
                    continue;
                }
            }
            if (byOrganizer) {
                if (tickets[i].organizer != _organizer) {
                    continue;
                }
            }
            if (byAge) {
                if (tickets[i].age != _age) {
                    continue;
                }
            }
            if (byLimit) {
                if (tickets[i].limit != _limit) {
                    continue;
                }
            }

            filteredTickets[numberTickets] = tickets[i];
            numberTickets++;
        }

        assembly {
            mstore(filteredTickets, numberTickets)
        }

        return filteredTickets;
    }

    function updateTicketValue(uint256 _id, uint256 _value) public returns (bool) {
        if (_value < taxTransfer) {
            revert("Value cannot be less than 10000 wei");
        }
        
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].id == _id) {
                if (tickets[i].owner != msg.sender) {
                    revert("You are not the owner of this ticket.");
                }

                tickets[i].value = _value;

                return true;
            }
        }

        revert("Ticket not found.");
    }

    function getTicketById(uint256 _id) public view returns (Ticket memory) {
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].id == _id) {
                return tickets[i];
            }
        }
        revert("not found");
    }

    function verifyTicket(uint256 _ticketId, bytes32 _hashedMessage, address _owner, uint8 _v, bytes32 _r, bytes32 _s) public {
        bytes32 hashMessage = keccak256(abi.encodePacked("ticketId=", _uint256ToString(_ticketId)));
        if (hashMessage != _hashedMessage) {
            revert();
        }
        
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, _hashedMessage));
        address recoveredSigner = ecrecover(prefixedHashMessage, _v, _r, _s);
        if (recoveredSigner != _owner) {
            revert();
        }

        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].id == _ticketId) {
                if (tickets[i].owner != _owner) {
                    revert();
                }
                if (tickets[i].organizer != msg.sender) {
                    revert();
                }

                tickets[i] = tickets[tickets.length - 1];
                tickets.pop();

                return;
            }
        }

        revert();
    }

    function _uint256ToString(uint256 number) internal pure returns (string memory) {
        if (number == 0) {
            return "0";
        }
        
        uint256 tempNumber = number;
        uint256 digits;
        
        while (tempNumber != 0) {
            digits++;
            tempNumber /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (number != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + number % 10));
            number /= 10;
        }
        
        return string(buffer);
    }
}
