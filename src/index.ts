/*you provided is a TypeScript code that sets up an Express server and defines several routes
for handling HTTP requests. */
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { GHL } from "./ghl";
import * as CryptoJS from 'crypto-js'
import { json } from "body-parser";
import axios from "axios";

const path = __dirname + "/ui/dist/";


dotenv.config();
const app: Express = express();
app.use(json({ type: 'application/json' }))

/*`app.use(express.static(path));` is setting up a middleware in the Express server. The
`express.static` middleware is used to serve static files such as HTML, CSS, JavaScript, and images. */
app.use(express.static(path));

/* The line `const ghl = new GHL();` is creating a new instance of the `GHL` class. It is assigning
this instance to the variable `ghl`. This allows you to use the methods and properties defined in
the `GHL` class to interact with the GoHighLevel API. */
const ghl = new GHL();

const port = process.env.PORT;

/*`app.get("/authorize-handler", async (req: Request, res: Response) => { ... })` sets up an example how you can authorization requests */
app.get("/authorize-handler", async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) {
    return res.status(403).send("Unauthorized code");
  }
  await ghl.authorizationHandler(code as string);
  res.status(200).send("Authorized");
});

/*`app.post("example-webhook-handler",async (req: Request, res: Response) => {
    console.log(req.body)
})` sets up a route for handling HTTP POST requests to the "/example-webhook-handler" endpoint. The below POST
api can be used to subscribe to various webhook events configured for the app. */
app.post("/create-short-link",async (req: Request, res: Response) => {
    
    const { vsl_short_io_auth, ...newBody } = req.body

    const url = 'https://api.short.io/links';
    const options = {
      method: 'POST',
      url,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: vsl_short_io_auth
      },
      data: JSON.stringify(req.body)
    };

    try {
      const response = await axios.request(options);
      const data = await response.data();
      res.status(201).send(data)
    } catch (error: any) {
      if(error.response){
        return res.status(error.response.status).send(error.response.data)
      } else if(error.request){
        return res.status(400).send(error.request)
      } else {
        return res.status(400).send(error.message)
      }
    }
})


/* The `app.post("/decrypt-sso",async (req: Request, res: Response) => { ... })` route is used to
decrypt session details using ssoKey. */
app.post("/decrypt-sso",async (req: Request, res: Response) => {
  const {key} = req.body || {}
  if(!key){
    return res.status(400).send("Please send valid key")
  }
  try {
    const data = ghl.decryptSSOData(key)
    res.send(data)
  } catch (error) {
    res.status(400).send("Invalid Key")
    console.log(error)  
  }
})

/*`app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});` sets up a route for the root URL ("/") of the server.  This is
 used to serve the main HTML file of a web application. */
app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});

/*`app.listen(port, () => {
  console.log(`GHL app listening on port `);
});` is starting the Express server and making it listen on the specified port. */
app.listen(port, () => {
  console.log(`GHL app listening on port ${port}`);
});
