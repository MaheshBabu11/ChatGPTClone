
## Crafting your own AI chat app using Hilla and Spring AI

![](https://cdn-images-1.medium.com/max/13824/1*3zeQo8o50EDGuh7mdIFt0A.png)

Artificial intelligence has surpassed its niche to become a fundamental part of our daily lives, revolutionizing the way we engage with technology. The incorporation of powerful AI capabilities within applications has stimulated innovation and revolutionized user experiences in this era of seamless connectivity and rapid improvements.

If you have been keeping up to date with the Spring ecosystem, you may have heard about the Spring AI Project, It is currently in its pre-release state but it provides an innovative abstraction toolkit fostering AI integration across applications. The experimental [Spring AI](https://github.com/spring-projects-experimental/spring-ai) project was introduced during the [SpringOne](https://springone.io/) conference and allows the creation of AI applications by using common concepts of Spring. Currently, the project integrates [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) and [OpenAI](https://openai.com/) as AI backends. Use cases like content generation, code generation, semantic search, and summarization are supported by the project.

In this article, we’ll embark on a journey through the convergence of Spring AI’s versatile abstractions and Hilla’s dynamic chat functionalities to create a powerful AI-driven chat application. Let's get started.

There are many ways to go about setting up the project, you can either include the Maven dependency for Hilla directly into your project, or you can visit [Vaadin Starter](https://start.vaadin.com/app) to obtain the starter project.

In our case, we are going to download the project from Vaadin Starter with the following presets:

![Hilla project presets](https://cdn-images-1.medium.com/max/2000/1*dQul36Qe9_ZbOsBtC1jZVw.png)

Once the project has been downloaded you can open it in the IDE of your choice, I use IntelliJ Idea. Now let's add the Spring AI dependency.

The Spring AI project provides artifacts in the Spring Milestone Repository. You will need to add configuration to add a reference to the Spring Milestone repository in your build file. For example, in our case ie. for Maven, add the following repository definition in Your POM.xml file.

    <repositories>
        <repository>
          <id>spring-snapshots</id>
          <name>Spring Snapshots</name>
          <url>https://repo.spring.io/snapshot</url>
          <releases>
            <enabled>false</enabled>
          </releases>
        </repository>
      </repositories>

And the Spring Boot Starter depending on if you are using Azure Open AI or Open AI.

* Azure OpenAI


    <dependency>
            <groupId>org.springframework.experimental.ai</groupId>
            <artifactId>spring-ai-azure-openai-spring-boot-starter</artifactId>
            <version>0.7.1-SNAPSHOT</version>
    </dependency>

* OpenAI


    <dependency>
            <groupId>org.springframework.experimental.ai</groupId>
            <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
            <version>0.7.1-SNAPSHOT</version>
    </dependency>

We will be using the openai dependency for our use case here so go ahead and add the dependency and reload the project to download all the necessary files. If it’s properly imported you will get a folder structure similar to this:

![](https://cdn-images-1.medium.com/max/2000/1*tawm4AUAtT7VKg3ET5YVSw.png)

Let's edit this to add our UI using some prebuilt components from Hilla. We will go ahead and rename MainView.tsx to MainLayout.tsx, add this to MainLayout
```javascript
import {AppLayout} from '@hilla/react-components/AppLayout.js';
import {DrawerToggle} from '@hilla/react-components/DrawerToggle.js';
import Placeholder from 'Frontend/components/placeholder/Placeholder';
import {useRouteMetadata} from 'Frontend/util/routing';
import {Suspense} from 'react';
import {NavLink, Outlet} from 'react-router-dom';

const navLinkClasses = ({ isActive }: any) => {
  return `block rounded-m p-s ${isActive ? 'bg-primary-10 text-primary' : 'text-body'}`;
};

export default function MainLayout() {
  const currentTitle = useRouteMetadata()?.title ?? 'My App';
  return (
    <AppLayout primarySection="drawer">

      <DrawerToggle slot="navbar" aria-label="Menu toggle"></DrawerToggle>
      <h2 slot="navbar" className="text-l m-0">
        {currentTitle}
        <span style={{ fontSize: 'small', color: 'red'}}>
         &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  (The spring ai package currently doesn't stream response, hence responses will be delayed for longer responses)</span>
      </h2>

      <Suspense fallback={<Placeholder />}>
        <Outlet />
      </Suspense>
    </AppLayout>
  );
}

```
Here we are importing AppLayout and DrawerToggle from the @hilla/react-components package for layout elements. App Layout is a component for building common application layouts. The Drawer Toggle shows and hides the drawer using a Drawer Toggle (or a Button). Placeholder is a custom component that we are going to be defining below containing the progress bar for now. useRouteMetadata from 'Frontend/util/routing' will be used for fetching route metadata. Suspense, NavLink, and Outlet from react and react-router-dom for managing asynchronous loading, navigation, and rendering of nested routes.

The navLinkClasses defines a function navLinkClasses that accepts a parameter (isActive), which is used to determine the active state of navigation links. The MainLayout component uses useRouteMetadata() hook to fetch the current title from route metadata, defaulting to 'My App' if unavailable and renders the layout structure. It utilizes AppLayout from Hilla, setting primarySection="drawer" for layout configuration. It implements a <Suspense> component with a <Placeholder /> fallback for rendering the content using <Outlet />, allowing for nested routes to be rendered dynamically.

Now we will create a new chat package and add the ChatView Component to chat as shown below :
```javascript
import {useState} from "react";
import {MessageList, MessageListItem} from "@hilla/react-components/MessageList";
import {MessageInput} from "@hilla/react-components/MessageInput";
import {AiService} from "Frontend/generated/endpoints";
import user from "Frontend/resources/user-profile.png"
import assistant from "Frontend/resources/virtual-assistant.png"

export default function ChatView() {
    const [messages, setMessages] = useState<MessageListItem[]>([]);

    async function sendMessage(message: string) {
        setMessages(messages => [...messages, {
            text: message,
            userName: 'You',
            time: new Date().toLocaleTimeString(),
            userImg: user,
            theme: 'current-user',
        }]);

        const response = await AiService.chat(message);
        setMessages(messages => [...messages, {
            text: response,
            userName: 'Assistant',
            userImg: assistant,
            time: new Date().toLocaleTimeString()
        }]);
    }

    return (
      <div className="p-m flex flex-col h-full box-border">
          <MessageList items={messages} className="flex-grow"/>
          <MessageInput onSubmit={e => sendMessage(e.detail.value)}/>
      </div>
    );
}
```
This ChatView component sets up a simple chat interface utilizing components from the Hilla framework for message input and display. It maintains the state of messages using React's useState hook. The component initializes an empty array, messagesto store chat messages and uses the useState hook to manage this state. The sendMessage function is an asynchronous function triggered when a message is sent.

Upon sending a message, it updates the local messages state to include the user's message, displaying it within the chat interface. It then asynchronously calls the AiService.chat(message) method, likely an endpoint from the generated AiService class, to interact with an AI service. Upon receiving a response, it updates the messages state again, this time displaying the assistant's response within the chat.

The structure of the returned JSX involves a container div with a flex layout to manage the chat view's appearance. Inside this container, it renders the MessageList component from Hilla, displaying the chat messages. The MessageInput component allows users to input messages and triggers the sendMessage function upon submission.

This component orchestrates a chat interface where users can interact by sending messages, and it dynamically updates the chat display with both user and AI-generated responses.

Now, we will add a new package for other components we are going to be adding like this

![components folder structure](https://cdn-images-1.medium.com/max/2000/1*XEStv84mOEY3i-YUgvkXbw.png)

We will add the PlaceHolder component here as follows :
```javascript
import { ProgressBar } from '@hilla/react-components/ProgressBar.js';

export default function Placeholder() {
  return <ProgressBar indeterminate={true} className="m-0" />;
}
```
The Placeholder component is a simple component that displays a progress bar using the ProgressBar component from the Hilla framework. When you’re waiting for something to load or when you want to show that some process is ongoing (like fetching data or performing an action), you often use a visual indicator to let users know that the system is working. In this case, the ProgressBar serves as that indicator.

We will now update the new routes in our application in the routes.tsx file
``` javascript
import ChatView from 'Frontend/views/chat/ChatView';
import MainLayout from 'Frontend/views/MainLayout.js';
import { lazy } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';


export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    handle: { title: 'Main' },
    children: [
      { path: '/', element: <ChatView />, handle: { title: 'AI Chat' } }
    ],
  },
];

export default createBrowserRouter(routes);
```
We will then add the AI Service to facilitate the chat for this we will be referencing the Spring AI Apis.
```java
package com.maheshbabu11.service;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import dev.hilla.BrowserCallable;
import org.springframework.ai.client.AiClient;

@BrowserCallable
@AnonymousAllowed
public class AiService {

    private final AiClient aiClient;

    public AiService(AiClient aiClient) {

        this.aiClient = aiClient;
    }

    public String chat(String prompt) {
        return aiClient.generate(prompt);
    }
}
```
Here @BrowserCallable indicates that this class or its methods can be called from the browser and AnonymousAllowed allows this class or methods within it to be accessed anonymously, typically used in web-related security configurations.

You will also need to add your OpenAI keys in the application.properties file.

    spring.ai.openai.api-key=<Open AI Key>

With all that set and configured, we can run the project. Once the application starts running, you can open it in your browser on port 80 and see it as shown below :

![AI Chat app](https://cdn-images-1.medium.com/max/3836/1*mk0-m1AwPFAmoCt0Z_n3rQ.png)

You can check the full source code here 👇

[**GitHub - MaheshBabu11/ChatGPTClone: ChatGPTClone using Hilla and Spring AI**](https://github.com/MaheshBabu11/ChatGPTClone)



For more info about Spring AI or Hilla, you can check the resources below :

* [https://github.com/spring-projects/spring-ai](https://github.com/spring-projects/spring-ai)

* [https://hilla.dev/](https://hilla.dev/)

Happy Coding 😊!!!




