import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  @Output() loginStatus: EventEmitter<number> = new EventEmitter<number>();

  username: string = '';
  password: string = '';

  constructor(private http: HttpClient) {}

  login() {
    // Make HTTP request to the dummy JSON API
    this.http.get<any[]>('https://dummyjson.com/users').subscribe(
      (users) => {
        // Check if the provided username and password match any user from the API
        console.log(users["users"][0]);
        let found = false;
        for (let i = 0; i < users['users'].length; i++) {
          console.log(users['users'][i].username)
          console.log(users['users'][i].password)
          if (
            users['users'][i].username === this.username &&
            users['users'][i].password === this.password
          ) {
            found = true;
            console.log('Login correct');
            this.loginStatus.emit(i);
            // You can perform further actions here, such as navigating to another page
            break; // No need to continue iterating if the login is correct
          }
        }
        if (!found) {
          console.log('Invalid username or password');
          this.loginStatus.emit(-1);
          // Handle incorrect login credentials, e.g., display an error message
        }
      },
      (error) => {
        console.error('Error:', error);
        // Handle error cases, e.g., display an error message
      }
    );
  }
}
