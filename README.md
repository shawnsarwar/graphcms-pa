# Pyramid Analytics: GraphCMS Plugin

This plugin allows you to connect your GCMS instance to a single user on a Pyramid instance for the purpose of later embedding content into webpages. Once the plugin has been installed, it allows users building content to select from among the Pyramid Users content for items to embed. A reference to the content along with the users embed token are saved in the CMS for rendering.

### **A Note on Embed Security**

Since GraphCMS does not hide credentials from administrators this "Embed User" in Pyramid should be a viewer in their own group. Their credential will be used by everyone who is creating embeds, and all embedded views of the content will be attributed to this user. Content should be explicitly shared _to_ this user when it's ready for publication as embeds. Treat this user as the general public and only allow them access to public content. The embed_token included with each piece of content has the ability to allow embedded access to all of their content, if the contentID is known.

## Installation

Graph CMS allows UI widgets that can create content to be saved in the CMS. This plugin creates a piece of JSON that fully describes an embed. GCMS plugins are opened as iFrames, so they must be hosted somewhere. This plugin is a completely static client side app (runs fully in the browser). It can be hosted from anywhere, but the simplest way to try it out is to use github.com's hosting of this repository: E.G. https://shawnsarwar.github.io/graphcms-pa. You can of course, fork this repository and host it from your own repo, or as a static site.

Once you have it hosted, you need to add the Extension to your GCMS deployment:

**(UI Extensions Menu)**

![image info](./doc/new-extension.jpg)

If you don't don't want to self-host, you can use:
https://shawnsarwar.github.io/graphcms-pa, which is the webpacked version of the `main` branch of this repository.

**(Extension Settings)**

![image info](./doc/ext-settings.jpg)

Now you need to provide some information about your Pyramid Analytics instance. 

Most of the fields are self explanatory, but the `Embed Domain` is *critically important* and you won't know it's wrong until you try to render your embeds. This should be **domain** of the site where you will be hosting the embeds themselves, not necessarily of the CMS and definitely not of the Pyramid Server.

**(Schema Inclusion)**

![image info](./doc/schema-view.jpg)

Now that we have the UI Element plugin installed, you just need to include the field in any schemas that you want to house embeds. Here's a very simple schema with a title and an embed. Then, when you create an instance of the object this schema describes, the Embed Widget will be part of the form.

## Usage


**(Creating a new Item)**
![image info](./doc/new-content-1.jpg)

This content, "Embed View" is what we defined in the previous step. You can see that you set the Title and then have a button in "Pyramid Content" which you can press to open a picker.

**(Pyramid Content Picker)**
![image info](./doc/new-content-2.jpg)

This picker provides a view of the Embed users folders and content. Selecting a piece of content will insert the relevant details into the form for the CMS to save.

**(Content Selected)**

![image info](./doc/new-content-3.jpg)
Once content is selected, you'll see the name of the content from the server, and can later edit the entry to re-open the picker and change the content from the server.

**(List View)**
![image info](./doc/new-content-4.jpg)

You change the selected content from the list view, but you can view the name of the Selected Pyramid Content.

Exploring what GraphCMS saves, you'll see this result for the above EmbedView entity.

```json
{
	"id": "cksykxcwg9rs50b98qlmym64m",
	"stage": "DRAFT",
	"updatedAt": "2021-08-30T11:49:46.833766+00:00",
	"createdAt": "2021-08-30T11:49:46.833766+00:00",
	"publishedAt": null,
	"publishedBy": null,
	"pyramidContent": {
		"url": "https://demo2020.pyramidanalytics.com",
		"contentID": "99016871-89e7-42e1-b567-f0193c53266a",
		"description": "companies metadata",
		"embed_token": "{The embed token would be here here}",
        "embed_domain": "https://embedsite.my-organization.net"
	},
	"title": "A Single Piece of Content",
	"createdBy": {
		"entryId": "cksh7lukx10yr01xldv2tawh1",
		"name": "Shawn Sarwar",
		"picture": "https://lh3.googleusercontent.com/a-/someid",
		"kind": "MEMBER",
		"isActive": true
	},
	"updatedBy": {
		"entryId": "cksh7lukx10yr01xldv2tawh1",
		"name": "Shawn Sarwar",
		"picture": "https://lh3.googleusercontent.com/a-/someid",
		"kind": "MEMBER",
		"isActive": true
	},
	"documentInStages": [{
		"id": "cksykxcwg9rs50b98qlmym64m",
		"stage": "DRAFT",
		"updatedAt": "2021-08-30T11:49:46.833766+00:00",
		"publishedAt": null
	}]
}
```

## Rendering Saved Embeds

The schema for the "embed object" which will be saved in the CMS is:
```typescript
    {
        "url": String,          // The URL of the Pyramid Server
		"contentID": String     // The ID of the selected Content to be Embedded
		"description": String   // A Friendly Name for the content as defined on the Pyramid Server
		"embed_token": String   // A Copy of the embed token used to access the content
        "embed_domain": String  // The Domain from which this embed *must* be served
    }
```
Since GraphCMS is headless, you'll need to render the embed yourself. You *may only* embed on the domain that you set as your "Embed Domain" in your plugin settings.

Using the [Pyramid Embed Library](https://help.pyramidanalytics.com/Content/Root/developer/reference/Extensibility/Embedding/embed%20API/PyramidEmbedClient/pyramidEmbedClient.htm?tocpath=Tech%20Reference%7CExtensibility%7CEmbedding%7CEmbed%20API%7CPyramidEmbedClient%7C_____0) it should be as simple as:

```javascript
    var client = new PyramidEmbedClient(obj.url);
    var embedElement = document.getElementById("MyEmbedTargetLocationID");
    client.setAuthToken(obj.embed_token);
    client.init();
    client.setAuthFailureCallback(onErr)
    client.embed(
        embedElement,
        {
            contentId: obj.contentID,
        }
    );

```