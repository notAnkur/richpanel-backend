## Richpanel-backend

## API Documentation

#### 1. Login
> https://richpanel-facebook.herokuapp.com/auth/facebook<br>
> GET <br>

> Payload
```js
```
> Response
```js
{
  "token": "fasdfjksadjfkasdfkljas.dfklsdajfk.fasdfsdkafjkfjsdlakfj",
  "profile": {
    "emails": [
      {
        "value": "email@em.com"
      }
    ],
    "photos": [
      {
        "value": "url"
      }
    ],
    "_id": "60fa6b2502b7ac001c3e82cd",
    "fbid": "123456678",
    "firstName": "Ank",
    "lastName": "Dev",
    "displayName": "Ank Dev",
    "accessToken": "",
    "createdAt": "2021-07-23T07:09:25.833Z",
    "updatedAt": "2021-07-23T07:09:25.854Z"
  },
  "isLoggedIn": true,
  "message": "Successful login"
}
```

### 2. Get Conversations
> https://richpanel-facebook.herokuapp.com/conversations<br>
> GET <br>

> Auth (required): Bearer token

> Response
```js
{
  "conversations": [
    {
      "_id": "60fa2b982c235520c452c3b5",
      "id": "1234567_12345667",
      "message": "test comment",
      "type": "POST",
      "firstName": "Test",
      "lastName": "page",
      "profileId": "123456677",
      "pageId": "1234566778",
      "profilePic": "",
      "createdAt": "2021-07-23T02:38:16.030Z",
      "__v": 0
    },
    {
      "_id": "60fa58e9f9869dfea2296b40",
      "id": "60fa58e90c24e64f3cc1fb28",
      "__v": 0,
      "createdAt": "2021-07-23T05:51:37.040Z",
      "firstName": "",
      "lastName": "",
      "message": "fasdfasd asdf f dsaf sda asd ffsdaffd",
      "pageId": "1234567756",
      "profileId": "1234567890",
      "profilePic": "",
      "recipientId": "12345677890",
      "type": "DM"
    }
  ]
}
```

### 3. Get Conversation By ID
> https://richpanel-facebook.herokuapp.com/conversations<br>
> POST <br>

> Auth (required): Bearer token

> Returns the conversation history in cronological order<br>

> Payload
```js
{
	"conversationId": "1234567812348",
	"senderId": "1234567890987",
	"recipientId": "123456789087"
}
```

> Response
```js
{
  "conversations": [
    {
      "_id": "60fa2b982c235520c452c3b7",
      "id": "123456789_12345678989",
      "message": "comment?!",
      "type": "POST",
      "firstName": "Test",
      "lastName": "page",
      "profileId": "105307131846198",
      "pageId": "105307131846198",
      "profilePic": "",
      "createdAt": "2021-07-23T02:38:16.046Z",
      "__v": 0
    },
    {
      "id": "123456789_12345678909",
      "message": "comment?!",
      "type": "POST",
      "firstName": "Test",
      "lastName": "Test",
      "profileId": "105307131846198",
      "pageId": "105307131846198",
      "profilePic": "",
      "createdAt": "2021-07-23T03:43:00.464Z"
    },
    {
      "id": "123456789_123456789",
      "message": "more comment?!",
      "type": "POST",
      "firstName": "Test",
      "lastName": "Test",
      "profileId": "105307131846198",
      "pageId": "105307131846198",
      "profilePic": "",
      "createdAt": "2021-07-23T03:43:00.474Z"
    }
  ]
}
```

### 4. Respond to post comments
> https://richpanel-facebook.herokuapp.com/conversations/{conversation_id}<br>
> POST <br>

> Auth (required): Bearer token

> Posts a comment to the conversation_id<br>

> Payload
```js
{
	"message": "This is a test message"
}
```

> Response
```js
{
  "newComment": {
    "id": "105318295178415_105828581794053",
    "message": "jhafsdjfh asdjhfasjdh fjasdh fhasdj fhsjadfk sadf",
    "type": "POST",
    "firstName": "Test",
    "lastName": "Test",
    "profileId": "105307131846198",
    "pageId": "105307131846198",
    "profilePic": "",
    "createdAt": "2021-07-23T04:25:05+0000"
  }
}
```

### 5. Get Messenger Userinfo
> https://richpanel-facebook.herokuapp.com/messenger/profile/105307131846198<br>
> GET <br>

> Auth (required): Bearer token

> Returns the userinfo, given the messenger id<br>

> Response
```js
{
  "firstName": "Test",
  "lastName": "Test",
  "profilePic": "",
  "id": "12134512345"
}
```

### 6. Post Messenger Response
> https://richpanel-facebook.herokuapp.com/messenger/respond/{conversation_id}<br>
> POST <br>

> Auth (required): Bearer token

> Sends a reply to the given conversation_id<br>

> Payload
```js
{
	"message": "this is a demo text"
}
```

> Response
```js
{
  "response": {
    "recipient_id": "6083156825035347",
    "message_id": "m_8QH8VwLJCqyXBY-U23-NCBdvJKRUq6L4MTisDnnwvyrO5bDhv-oHVw75TPUtA6Hohv0Xnzr3k2gh0mfcn3FenQ"
  }
}
```

### 7. Verify Token
> https://richpanel-facebook.herokuapp.com/auth/verifyoldtoken<br>
> POST <br>

> Auth (required): Bearer token

> Verifies the client jwt token<br>

> Response
```js
{
  "isLoggedIn": true,
  "message": "Token still valid"
}
```