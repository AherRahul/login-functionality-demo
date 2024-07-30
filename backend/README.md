<p align="center">
 <a href="https://rahulaher.netlify.app">
  <img src="https://rahulaher.netlify.app/img/logo/glyph-black-colored.svg" alt="Rahul Aher" width="250" />
 </a>
</p>

# Login App Backend

## Features
1. Signup and signin authentication
2. Forgot password and reset password
3. Change password when logged in

## Main tools
- Node.js
- Typescript
- MongoDB
- Mongoose
- Redis
- Express
- Bull
- Nodemailer
- Sendgrid mail
- Cloudinary
- Jest
- Lodash

## Requirements

- Node 16.x or higher
- Redis ([https://redis.io/download/](https://redis.io/download/))
- MongoDB ([https://www.mongodb.com/docs/manual/administration/install-community/](https://www.mongodb.com/docs/manual/administration/install-community/))
- Typescript
- API key, secret and cloud name from cloudinary [https://cloudinary.com/](https://cloudinary.com/)
- Local email sender and password [https://ethereal.email/](https://ethereal.email/)

You'll need to copy the contents of `.env.development.example`, add to `.env` file and update with the necessary information.

## Local Installation

- There are three different branches develop, staging and main. The develop branch is the default branch.

```bash
git clone -b develop https://github.com/AherRahul/login-functionality-demo.git
npm install
```

- To start the server after installation, run (Windows)
```bash
npm run dev:win
```

- To start the server after installation, run (Windows)
```bash
npm run dev:mac
```

Make sure mongodb and redis are both running on your local machine.

## Unit tests

- You can run the command `npm run test` to execute the unit tests added to the features controllers.

## API Endpoints
- The actual endpoints for the application can be found inside the folder named endpoints. 
- The endpoint files all have a `.http` extension. 
- To use this files to make api calls, install the extension called [rest client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) on vscode.
- Update the endpoints http files before using.
- The files inside the endpoints folder contains APIs for
  - Authentication
  - User

## View Data
- You can view the contents of your redis cache by using a tool called [redis-commander](https://www.npmjs.com/package/redis-commander).
- Download mongodb compass to view data. [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass).
