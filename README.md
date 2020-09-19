# O10
- A platform for identities sharing with proactive safety protection and privacy-preserving, accenting user experience at emergencies
- Must read document https://github.com/maxonrow/maxathon
- Project Link : https://platform-hackathon.maxonrow.com/#/projects/5f5440a5d480ac001bb8d4bd
- Team Members :
  1. Kirill Gandyl
  2. Alae El Jai
  3. Peter Weyand
  4. Mujistapha Ahmed
  5. Oluwafemi Akinde

## Project dockerization
### Prerequisites
Before composing docker image it will be required to add some folders into shared folders at your docker settings

#### For iOS
At your Docker for iOS go to Docker -> Preferences... -> File Sharing
Add there the following folders:
- /Microsoft/UserSecrets
- /ASP.NET/Https

#### For Widows
At your Docker for Windows go to Settings -> Resources -> File Sharing
Add there the following folders:
- /Microsoft/UserSecrets
- /ASP.NET/Https

### Docker composing
For running project just launch docker-compose:

```
$ docker-compose up -d 
```

Check if portal, gateway and node are up and running and are connected to each other:
```
$ curl --location --request GET 'http://localhost:5003/Diagnostic'
```

There should be returned response as follows:
```
[
    {
        "context": "Portal",
        "infoType": "Version",
        "message": "1.0.0.0"
    },
    {
        "context": "Gateway",
        "infoType": "Version",
        "message": "1.0.0.0"
    },
    {
        "context": "Node",
        "infoType": "Version",
        "message": "1.0.0.0"
    }
]
```