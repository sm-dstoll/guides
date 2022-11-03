# Using Google Drive Images with your Digital Person

The default image content card requires a hosted image to display in a conversation. Unfortunatley, the default `share` url that is provided by Google Drive for the image does not properly show in our conversations. After publicly sharing the image, you need to provide your image component with a url in the following format:

`https://drive.google.com/uc?id=<YOUR_IMAGE_ID>`

`YOUR_IMAGE_ID` can be retrieved from the share url, ex: `https://drive.google.com/file/d/<YOUR_IMAGE_ID>/view?usp=sharing`

> This format only works if your image is shared PUBLICLY. It cannot be only available to those in your organization.