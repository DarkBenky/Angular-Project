import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { Time } from '@angular/common';
import { GenderizeService } from './gender.service';
import { PostCode } from './state.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  NumberOfUsers: number;
  isLoggedIn: boolean = false;
  User: object;
  Users;
  FirstName: string;
  LastName: string;
  Email: string;
  LoginTime: string;
  ID: number;
  gender: string;
  showAddress = false;
  constructor(
    private http: HttpClient,
    private genderizeService: GenderizeService,
    private postCode: PostCode
  ) {}
  TotalClicks: number = 0;
  showDetails = false;
  Details = {
    firstname: NaN,
    lastname: NaN,
    username: NaN,
    birthdate: NaN,
    img: NaN,
    eyeColor: NaN,
    university: NaN,
    macAddress: NaN,
    ip: NaN,
    city: NaN,
    gender: '',
    address: NaN,
  };
  recipientId: number;
  currentMessage: string = '';
  currentChat = null;
  HistoryChats = [];
  totalCharacters = 0;
  totalChats = 0;
  userChats = {};

  getNumberOfCharacters(id: number) {
    let totalCharacters = 0;
    for (let chat of this.HistoryChats) {
      if (chat.sender === id) {
        totalCharacters += chat.message.length;
      }
    }
    this.totalCharacters = totalCharacters;
  }

  getUserNameByID(id: number): string {
    for (let user of this.Users){
      if (user.id == id) {
        return user.firstName
      }
    }
  }

  getAllUserChats(id: number) {
    let groupedChats = {};

    for (let chat of this.HistoryChats) {
      if (chat.sender === id || chat.recipient === id) {
        const otherPartyID = chat.sender === id ? chat.recipient : chat.sender;
        const userName = this.getUserNameByID(id);
        const otherPartyName = this.getUserNameByID(otherPartyID);
        const chatKey = [userName, otherPartyName].sort().join('-'); // Create a unique key for the chat

        if (!groupedChats[chatKey]) {
          groupedChats[chatKey] = [];
        }

        groupedChats[chatKey].push({
          sender: chat.sender,
          recipient: chat.recipient,
          message: chat.message,
          time: chat.time,
        });
      }
    }

    console.log(groupedChats);
    this.userChats = groupedChats;
  }

  hideDetails(){
    this.showDetails = !this.showDetails 
  }

  getChatKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getNumberOfChats(id: number) {
    const uniqueChats = new Set();
    for (let chat of this.HistoryChats) {
      if (chat.sender === id || chat.recipient === id) {
        const chatPair = [chat.sender, chat.recipient].sort().join('-');
        uniqueChats.add(chatPair);
      }
    }
    this.totalChats = uniqueChats.size;
  }

  getAllChatWhereID(id: number) {
    this.currentChat = [];
    for (let i = 0; i < this.HistoryChats.length; i++) {
      if (
        this.HistoryChats[i].sender === id ||
        this.HistoryChats[i].recipient === id
      ) {
        this.currentChat.push(this.HistoryChats[i]);
      }
    }
  }

  startChat(id) {
    this.recipientId = id;
    this.getAllChatWhereID(id);
  }

  hideChat() {
    this.currentChat = null;
  }

  sendMessage() {
    const message = this.currentMessage;
    const newMessage = {
      sender: this.ID,
      recipient: this.recipientId,
      message: message,
      time: new Date(),
    };

    this.currentChat.push(newMessage);
    this.HistoryChats.push(newMessage);

    // Prepare the body for the POST request
    const postBody = { text: message };

    // Send the POST request
    this.http.post<any>('https://httpbin.org/post', postBody).subscribe(response => {

      // Extract the last number from the IP address in the "origin" parameter
      const origin = response.origin;
      const ipParts = origin.split('.');
      const lastIpNumber = parseInt(ipParts[ipParts.length - 1]);

      console.log(origin)

      console.log(response)

      // Calculate the length of the reply message
      const replyLength = response.json.text.length + lastIpNumber;
      const replyMessage = 'A'.repeat(replyLength);

      const reply = {
        sender: this.recipientId,
        recipient: this.ID,
        message: replyMessage,
        time: new Date(),
      };

      // Append the user's reply to the chat history
      this.currentChat.push(reply);
      this.HistoryChats.push(reply);

      // Update the UI with the latest data
      this.getNumberOfCharacters(this.ID);
      this.getNumberOfChats(this.ID);
      this.getAllUserChats(this.ID);

      // Clear the current message input
      this.currentMessage = '';
    }, error => {
      console.error('Error sending message:', error);
    });
  }

  getUserByID(id: number) {
    return this.Users[id];
  }

  toggleAddressInfo() {
    this.showAddress = !this.showAddress;
  }

  getGenderInfo(name: string) {
    return this.genderizeService.getGender(name);
  }

  getPostInfo(PostCode: string) {
    return this.postCode.getPost(PostCode);
  }

  handleLoginStatus(isLoggedIn: number) {
    console.log(isLoggedIn);
    if (isLoggedIn != -1) {
      this.isLoggedIn = true;
      this.ID = isLoggedIn;
      this.getUser(isLoggedIn);
      const currentDate = new Date();

      // Extract individual components
      const day = currentDate.getDate(); // Day of the month (1-31)
      const month = currentDate.getMonth() + 1; // Month (0-11, add 1 to get actual month)
      const year = currentDate.getFullYear(); // Full year (e.g., 2022)
      const hours = currentDate.getHours(); // Hours (0-23)
      const minutes = currentDate.getMinutes(); // Minutes (0-59)
      const seconds = currentDate.getSeconds(); // Seconds (0-59)
      this.LoginTime = `${day}.${month} ${year} ${hours}:${minutes} ${seconds}s`;
    }
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getUser(index: number) {
    this.http.get<any[]>('https://dummyjson.com/users').subscribe(
      (users) => {
        try {
          const user = users['users'];
          console.log(user);
          this.Users = user;

          for (let i = 0; i < this.Users.length; i++) {
            this.Users[i]['clicked'] = false;
            // console.log(this.Users[i]);
          }
          this.NumberOfUsers = user.length;
          this.User = user[index];
          this.ID = this.User['id'];
          this.FirstName = this.User['firstName'];
          this.LastName = this.User['lastName'];
          this.Email = this.User['email'];
          this.getNumberOfCharacters(this.ID);
          this.getNumberOfChats(this.ID);
          // console.log(this.User);
        } catch (error) {
          console.error(error);
        }
      },
      (error) => {
        console.error('HTTP request error:', error);
      }
    );
  }

  selectUser(index: number) {
    this.setAllUsersSelectedFalse();
    this.setUserSelected(index);
  }

  setUserSelected(index) {
    this.Users[index]['clicked'] = true;
  }

  setAllUsersSelectedFalse() {
    for (let i = 0; i < this.Users.length; i++) {
      this.Users[i]['clicked'] = false;
      // console.log(this.Users[i]);
    }
  }

  getDetails(index: number) {
    this.showDetails = true;
    let firstName = this.Users[index].firstName;

    // Call getGenderInfo and wait for the response
    this.getGenderInfo(firstName).subscribe(
      (response) => {
        // Once you have the gender response, update Details
        this.Details = {
          firstname: firstName,
          lastname: this.Users[index].lastName,
          username: this.Users[index].username,
          birthdate: this.Users[index].birthDate,
          university: this.Users[index].university,
          macAddress: this.Users[index].macAddress,
          ip: this.Users[index].ip,
          city: this.Users[index].address.city,
          img: this.Users[index].image,
          eyeColor: this.Users[index].eyeColor,
          gender: response.gender, // Use the gender from the response
          address: NaN, // Initialize with NaN
        };

        // Call getPostInfo with the correct postcode
        const postcode = this.Users[index].address.postalCode;
        console.log(postcode);
        this.getPostInfo(postcode).subscribe(
          (response) => {
            console.log(response);
            this.Details.address = response;
          },
          (error) => {
            console.error('Error fetching address:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching gender:', error);
      }
    );
  }

  getAddressEntries(): { key: string; value: any }[] {
    return this.Details.address
      ? Object.entries(this.Details.address).map(([key, value]) => ({
          key,
          value,
        }))
      : [];
  }

  stringify(data: any): string {
    return JSON.stringify(data, null, 2); // Pretty-print the JSON object
  }

  addClick() {
    this.TotalClicks++;
  }

  logout() {
    // Your logout logic
    this.isLoggedIn = false;
  }

  ngOnInit(): void {
    console.log('on init...');
    this.getUser(1);
    console.log(this.User);
  }
}
