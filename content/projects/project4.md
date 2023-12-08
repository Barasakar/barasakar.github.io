---
title: "WashU Queue"
description: "An online queue for class office hours"
coverImage: "Images/projects_page/project_4_cover.png"
weight: 2
draft: false
---

## Introduction📓:
Office hours for large classes, especially before major project deadlines, often become hectic and busy for teaching assistants. Keeping track of the order of students needing assistance is challenging, with the current method limited to using a whiteboard to list names. This website seeks to resolve this issue by offering a clear and user-friendly interface. It introduces a more organized, queue-based system, allowing students to easily sign up for office hours and request help from the teaching assistants.

## Softwares Involve💻:
- **Programming languages:** Python, JavaScript, HTML, and CSS.
- **Tools:** MongoDB, Django Framework.


## Project Demo:
Users can login with their username and password, and if they aren't registered for the website, they could sign up by using the sign up form.
![login page](/Images/projects_content/project_4/login_page.png)

Once logged in, users can join the queue by entering their name, a question they have, and their location, whether it's a specific classroom or a Zoom link. Additionally, the website displays a list of available teaching assistants who are currently logged in and have the queue page open.
![queue page](/Images/projects_content/project_4/queue_page.png)

Here is an image that captures multiple users in the current session. There are two TAs, TA1 and TA2,with the teaching assistant role, and three students (jon, ben, and demo):
![queue page](/Images/projects_content/project_4/multiple_users.png)

As you can see, once a student joins the queue, they are not allowed to join the queue again (join button is grayed out) until they leave the queue or the TAs have finished assiting the student.

For TAs, their queue pages are similar to student's view. However, TAs' pages will have two buttons, `Answer` and `Delete` next to each student's queue entry.
![queue page TA view](/Images/projects_content/project_4/queuePage_TAview.png)

By clicking the `Answer` button, the server will receive the request and update the webpage so that both the student and the TA know they are currently being helped.
![help TA view](/Images/projects_content/project_4/help_TAview.png)
![help Student view](/Images/projects_content/project_4/help_Studentview.png)

Finally, TAs can terminate an Office Hour Queue session when the Office Hour is done. By clicking the `terminate session` button, TAs can disable all active users' join queue forms (except other TAs):
![help Student view](/Images/projects_content/project_4/terminate_session.png)