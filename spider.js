<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>A digital spider</title>
    <!-- Include external JavaScript file -->
    <script src="./test.js"></script>
    <style>
        /* Remove default margin and padding from body */
        body {
            margin: 0px;
            padding: 0px;
            position: fixed;
            /* Set the webpage background color to black */
            background: rgb(0, 0, 0);
        }
    </style>
</head>

<body>
    <!-- Create a canvas for graphic drawing -->
    <canvas id="canvas"></canvas>
</body>

</html>

You can see that our HTML code is very simple. Now, let's start performing operations on it!
2. JavaScript Code

Before we start writing the JavaScript code, let's clarify our thoughts:
Overall Process

    Initialize the canvas element and the drawing context when the page loads.
    Define the tentacle object, with each tentacle composed of multiple segments.
    Listen for mouse movement events to update the mouse position in real-time.
    Use an animation loop to draw the tentacles, which dynamically change based on the mouse position, creating a smooth animation effect.

The general process is as described above, but readers might not fully understand this flow without completing the code themselves. However, that's okay; let's begin writing our little spider for the web.
Note

To help readers better understand the logic of the code, we have added comments to each line of code, hoping that readers can gradually grasp the code with the help of these annotations.

JavaScript Code:

// Define the requestAnimFrame function
window.requestAnimFrame = function () {
    // Check if the browser supports requestAnimFrame
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        // If none of these options are available, use setTimeout to call the callback function
        function (callback) {
            window.setTimeout(callback);
        }
    );
};

// Initialization function to get the canvas element and return relevant information
function init(elemid) {
    // Get the canvas element
    let canvas = document.getElementById(elemid);
    // Get the 2D drawing context (note the lowercase 'd')
    c = canvas.getContext('2d');
    // Set the canvas width to the window's inner width and height
    w = (canvas.width = window.innerWidth);
    h = (canvas.height = window.innerHeight);
    // Set the fill style to semi-transparent black
    c.fillStyle = "rgba(30,30,30,1)";
    // Fill the entire canvas with the fill style
    c.fillRect(0, 0, w, h);
    // Return the drawing context and canvas element
    return { c: c, canvas: canvas };
}

// Execute the function after the page has fully loaded
window.onload = function () {
    // Get the drawing context and canvas element
    let c = init("canvas").c,
        canvas = init("canvas").canvas,
        // Set the canvas width to the window's inner width and height
        w = (canvas.width = window.innerWidth),
        h = (canvas.height = window.innerHeight),
        // Initialize the mouse object
        mouse = { x: false, y: false },
        last_mouse = {};

    // Define a function to calculate the distance between two points
    function dist(p1x, p1y, p2x, p2y) {
        return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
    }

    // Define the segment class
    class segment {
        // Constructor to initialize segment objects
        constructor(parent, l, a, first) {
            // If it's the first segment, position coordinates are at the top of the tentacle
            // Otherwise, position coordinates are at the next segment's coordinates
            this.first = first;
            if (first) {
                this.pos = {
                    x: parent.x,
                    y: parent.y,
                };
            } else {
                this.pos = {
                    x: parent.nextPos.x,
                    y: parent.nextPos.y,
                };
            }
            // Set the segment's length and angle
            this.l = l;
            this.ang = a;
            // Calculate the next segment's coordinates
            this.nextPos = {
                x: this.pos.x + this.l * Math.cos(this.ang),
                y: this.pos.y + this.l * Math.sin(this.ang),
            };
        }
        // Method to update segment position
        update(t) {
            // Calculate the angle to the target point
            this.ang = Math.atan2(t.y - this.pos.y, t.x - this.pos.x);
            // Update position coordinates based on the target point and angle
            this.pos.x = t.x + this.l * Math.cos(this.ang - Math.PI);
            this.pos.y = t.y + this.l * Math.sin(this.ang - Math.PI);
            // Update the nextPos coordinates based on the new position
            this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
            this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
        }
        // Method to reset the segment to its initial position
        fallback(t) {
            // Set position coordinates to the target point's coordinates
            this.pos.x = t.x;
            this.pos.y = t.y;
            this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
            this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
        }
        show() {
            c.lineTo(this.nextPos.x, this.nextPos.y);
        }
    }

    // Define the tentacle class
    class tentacle {
        // Constructor to initialize tentacle objects
        constructor(x, y, l, n, a) {
            // Set the top position coordinates of the tentacle
            this.x = x;
            this.y = y;
            // Set the tentacle's length
            this.l = l;
            // Set the number of segments
            this.n = n;
            // Initialize the target point object for the tentacle
            this.t = {};
            // Set a random parameter for the tentacle's movement
            this.rand = Math.random();
            // Create the first segment of the tentacle
            this.segments = [new segment(this, this.l / this.n, 0, true)];
            // Create the other segments
            for (let i = 1; i < this.n; i++) {
                this.segments.push(
                    new segment(this.segments[i - 1], this.l / this.n, 0, false)
                );
            }
        }
        // Method to move the tentacle to the target point
        move(last_target, target) {
            // Calculate the angle from the top of the tentacle to the target point
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            // Calculate the distance parameter for the tentacle
            this.dt = dist(last_target.x, last_target.y, target.x, target.y);
            // Calculate the target point coordinates for the tentacle
            this.t = {
                x: target.x - 0.8 * this.dt * Math.cos(this.angle),
                y: target.y - 0.8 * this.dt * Math.sin(this.angle)
            };
            // If a target point was calculated, update the last segment's position
            // Otherwise, update the last segment's position to the target point coordinates
            if (this.t.x) {
                this.segments[this.n - 1].update(this.t);
            } else {
                this.segments[this.n - 1].update(target);
            }
            // Iterate over all segment objects, updating their position
            for (let i = this.n - 2; i >= 0; i--) {
                this.segments[i].update(this.segments[i + 1].pos);
            }
            if (
                dist(this.x, this.y, target.x, target.y) <=
                this.l + dist(last_target.x, last_target.y, target.x, target.y)
            ) {
                this.segments[0].fallback({ x: this.x, y: this.y });
                for (let i = 1; i < this.n; i++) {
                    this.segments[i].fallback(this.segments[i - 1].nextPos);
                }
            }
        }
        show(target) {
            // If the distance from the tentacle to the target is less than its length, reset the tentacle
            if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                // Set the global composite operation to 'lighter'
                c.globalCompositeOperation = "lighter";
                // Begin a new path
                c.beginPath();
                // Start drawing lines from the tentacle's starting position
                c.moveTo(this.x, this.y);
                // Iterate over all segment objects and use their show method to draw lines
                for (let i = 0; i < this.n; i++) {
                    this.segments[i].show();
                }
                // Set the line style
                c.strokeStyle = "hsl(" + (this.rand * 60 + 180) +
                    ",100%," + (this.rand * 60 + 25) + "%)";
                // Set the line width
                c.lineWidth = this.rand * 2;
                // Set line cap style
                c.lineCap = "round";
                // Set line join style
                c.lineJoin = "round";
                // Draw the lines
                c.stroke();
                // Set the global composite operation back to 'source-over'
                c.globalCompositeOperation = "source-over";
            }
        }
        // Method to draw the circular head of the tentacle
        show2(target) {
            // Start a new path
            c.beginPath();
            // If the distance from the tentacle to the target is less than its length, draw a white circle
            // Otherwise, draw a dark cyan circle
            if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                c.arc(this.x, this.y, 2 * this.rand + 1, 0, 2 * Math.PI);
                c.fillStyle = "whith";
            } else {
                c.arc(this.x, this.y, this.rand * 2, 0, 2 * Math.PI);
                c.fillStyle = "darkcyan";
            }
            // Fill the circle
            c.fill();
        }
    }

    // Initialize variables
    let maxl = 400, // Maximum length of tentacles
        minl = 50, // Minimum length of tentacles
        n = 30, // Number of segments in each tentacle
        numt = 600, // Number of tentacles
        tent = [], // Array of tentacles
        clicked = false, // Whether the mouse is pressed
        target = { x: 0, y: 0 }, // Target point for the tentacles
        last_target = {}, // Last target point for the tentacles
        t = 0, // Current time
        q = 10; // Step size for tentacle movement

    // Create tentacle objects
    for (let i = 0; i < numt; i++) {
        tent.push(
            new tentacle(
                Math.random() * w, // x-coordinate of the tentacle
                Math.random() * h, // y-coordinate of the tentacle
                Math.random() * (maxl - minl) + minl, // Length of the tentacle
                n, // Number of segments
                Math.random() * 2 * Math.PI // Angle of the tentacle
            )
        );
    }
    // Method to draw the image
    function draw() {
        // If the mouse is moving, calculate the offset for the target point
        if (mouse.x) {
            target.errx = mouse.x - target.x;
            target.erry = mouse.y - target.y;
        } else {
            // Otherwise, calculate the x-coordinate for the target point
            target.errx =
                w / 2 +
                ((h / 2 - q) * Math.sqrt(2) * Math.cos(t)) /
                (Math.pow(Math.sin(t), 2) + 1) -
                target.x;
            target.erry =
                h / 2 +
                ((h / 2 - q) * Math.sqrt(2) * Math.cos(t) * Math.sin(t)) /
                (Math.pow(Math.sin(t), 2) + 1) -
                target.y;
        }

        // Update the target point coordinates
        target.x += target.errx / 10;
        target.y += target.erry / 10;

        // Update time
        t += 0.01;

        // Draw the target point for the tentacles
        c.beginPath();
        c.arc(
            target.x,
            target.y,
            dist(last_target.x, last_target.y, target.x, target.y) + 5,
            0,
            2 * Math.PI
        );
        c.fillStyle = "hsl(210,100%,80%)";
        c.fill();

        // Draw the center points of all the tentacles
        for (i = 0; i < numt; i++) {
            tent[i].move(last_target, target);
            tent[i].show2(target);
        }
        // Draw all the tentacles
        for (i = 0; i < numt; i++) {
            tent[i].show(target);
        }
        // Update the last target point coordinates
        last_target.x = target.x;
        last_target.y = target.y;
    }
    // Function to continuously execute the drawing animation
    function loop() {
        // Use requestAnimFrame to loop the execution
        window.requestAnimFrame(loop);

        // Clear the canvas
        c.clearRect(0, 0, w, h);

        // Draw the animation
        draw();
    }

    // Listen for window resize events
    window.addEventListener("resize", function () {
        // Reset the canvas size
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;

        // Call the loop function to continue the animation
        loop();
    });

    // Call the loop function to start the animation
    loop();
    // Use setInterval to repeat
    setInterval(loop, 1000 / 60);

    // Listen for mouse move events
    canvas.addEventListener("mousemove", function (e) {
        // Record the last mouse position
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;

        // Update the current mouse position
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
    }, false);

    // Listen for mouse leave events
    canvas.addEventListener("mouseleave", function (e) {
        // Set mouse to false
        mouse.x = false;
        mouse.y = false;
    });
};

Here, let’s briefly outline the flow of the code discussed above:

    Initialization Phase
        init Function: This function is called when the page loads. It retrieves the canvas element and sets its width and height to the size of the window. The obtained 2D drawing context (context) is used for subsequent drawing.
        window.onload: After the page has fully loaded, the canvas and context are initialized, and the initial state of the mouse is set.

    Definition of Tentacle Object
        Segment Class: This represents a segment of a tentacle. Each segment has a starting point (pos), length (l), and angle (ang), which is used to calculate the position of the next segment (nextPos).
        Tentacle Class: Represents a complete tentacle, composed of several segments. The starting point of the tentacle is at the center of the screen, and each tentacle contains multiple segments. The main methods of the tentacle include:
            move: Updates the position of each segment based on the mouse position.
            show: Draws the path of the tentacle.

    Event Listening
        canvas.addEventListener("mousemove", ...): Captures the mouse position when it moves and stores it in the mouse variable. Every time the mouse moves, the coordinates for mouse and last_mouse are updated for subsequent animations.

    Animation Loop
        draw Function: This is a recursive function that creates the animation effect.
            First, it fills the canvas with a semi-transparent background on each frame so that previously drawn content gradually fades, creating a trailing effect.
            Then, it iterates over all tentacles, calling their move and show methods to update their positions and draw each frame.
            Finally, it uses requestAnimFrame(draw) to continuously recursively call draw, forming an animation loop.

    Tentacle Behavior
        The motion of the tentacles is achieved through the move function, with the last segment updating its position first, followed by the other segments.
        The tentacles are drawn through the show function, which iterates over all segments and draws lines that are finally displayed on the screen.

— And that’s how we complete the production of our electronic little spider!!!

Finally, let’s take a look at the final effect:

A digital spider
profile
_SurveyJS
Promoted

SurveyJS custom survey software

Simplify data collection in your JS app with a fully integrated form management platform. Includes support for custom question types, skip logic, integrated CCS editor, PDF export, real-time analytics & more. Integrates with any backend system, giving you full control over your data and no user limits.

Learn more
Top comments (0)
Subscribe
pic
Code of Conduct • Report abuse
profile
Neon
Promoted

Billboard image
Create up to 10 Postgres Databases on Neon's free plan.

If you're starting a new project, Neon has got your databases covered. No credit cards. No trials. No getting in your way.

Try Neon for Free →
Read next
nmiller15 profile image
Anatomy of an ASP.NET MVC Template

Nolan Miller - Feb 8
chatgptnexus profile image
Cody AI Programming Assistant Overview

chatgptnexus - Jan 10
jajera profile image
Getting Started with Python: Creating a Hello World Project Using Poetry

John Ajera - Jan 6
prince_beec5ccde00b7c6c73 profile image
Interactive cards hover using the html css and javascript. Follow us on the instagram for more....

Prince - Feb 8
William

    Location
    Brooklyn, NY
    Joined
    Sep 9, 2024

More from William
🎁Learn Python in 10 Days: Day7
#python #backend #api #programming
🎁Learn Python in 10 Days: Day6
#programming #python #backend #backenddevelopment
Ensuring Image Upload Security: How to Verify Uploaded Files Are Genuine Images
#javascript #beginners #java #python
profile
Neon
Promoted

Billboard image
Create up to 10 Postgres Databases on Neon's free plan.

If you're starting a new project, Neon has got your databases covered. No credit cards. No trials. No getting in your way.

Try Neon →

// Define the requestAnimFrame function
window.requestAnimFrame = function () {
    // Check if the browser supports requestAnimFrame
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        // If none of these options are available, use setTimeout to call the callback function
        function (callback) {
            window.setTimeout(callback);
        }
    );
};

// Initialization function to get the canvas element and return relevant information
function init(elemid) {
    // Get the canvas element
    let canvas = document.getElementById(elemid);
    // Get the 2D drawing context (note the lowercase 'd')
    c = canvas.getContext('2d');
    // Set the canvas width to the window's inner width and height
    w = (canvas.width = window.innerWidth);
    h = (canvas.height = window.innerHeight);
    // Set the fill style to semi-transparent black
    c.fillStyle = "rgba(30,30,30,1)";
    // Fill the entire canvas with the fill style
    c.fillRect(0, 0, w, h);
    // Return the drawing context and canvas element
    return { c: c, canvas: canvas };
}

// Execute the function after the page has fully loaded
window.onload = function () {
    // Get the drawing context and canvas element
    let c = init("canvas").c,
        canvas = init("canvas").canvas,
        // Set the canvas width to the window's inner width and height
        w = (canvas.width = window.innerWidth),
        h = (canvas.height = window.innerHeight),
        // Initialize the mouse object
        mouse = { x: false, y: false },
        last_mouse = {};

    // Define a function to calculate the distance between two points
    function dist(p1x, p1y, p2x, p2y) {
        return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
    }

    // Define the segment class
    class segment {
        // Constructor to initialize segment objects
        constructor(parent, l, a, first) {
            // If it's the first segment, position coordinates are at the top of the tentacle
            // Otherwise, position coordinates are at the next segment's coordinates
            this.first = first;
            if (first) {
                this.pos = {
                    x: parent.x,
                    y: parent.y,
                };
            } else {
                this.pos = {
                    x: parent.nextPos.x,
                    y: parent.nextPos.y,
                };
            }
            // Set the segment's length and angle
            this.l = l;
            this.ang = a;
            // Calculate the next segment's coordinates
            this.nextPos = {
                x: this.pos.x + this.l * Math.cos(this.ang),
                y: this.pos.y + this.l * Math.sin(this.ang),
            };
        }
        // Method to update segment position
        update(t) {
            // Calculate the angle to the target point
            this.ang = Math.atan2(t.y - this.pos.y, t.x - this.pos.x);
            // Update position coordinates based on the target point and angle
            this.pos.x = t.x + this.l * Math.cos(this.ang - Math.PI);
            this.pos.y = t.y + this.l * Math.sin(this.ang - Math.PI);
            // Update the nextPos coordinates based on the new position
            this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
            this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
        }
        // Method to reset the segment to its initial position
        fallback(t) {
            // Set position coordinates to the target point's coordinates
            this.pos.x = t.x;
            this.pos.y = t.y;
            this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
            this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
        }
        show() {
            c.lineTo(this.nextPos.x, this.nextPos.y);
        }
    }

    // Define the tentacle class
    class tentacle {
        // Constructor to initialize tentacle objects
        constructor(x, y, l, n, a) {
            // Set the top position coordinates of the tentacle
            this.x = x;
            this.y = y;
            // Set the tentacle's length
            this.l = l;
            // Set the number of segments
            this.n = n;
            // Initialize the target point object for the tentacle
            this.t = {};
            // Set a random parameter for the tentacle's movement
            this.rand = Math.random();
            // Create the first segment of the tentacle
            this.segments = [new segment(this, this.l / this.n, 0, true)];
            // Create the other segments
            for (let i = 1; i < this.n; i++) {
                this.segments.push(
                    new segment(this.segments[i - 1], this.l / this.n, 0, false)
                );
            }
        }
        // Method to move the tentacle to the target point
        move(last_target, target) {
            // Calculate the angle from the top of the tentacle to the target point
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            // Calculate the distance parameter for the tentacle
            this.dt = dist(last_target.x, last_target.y, target.x, target.y);
            // Calculate the target point coordinates for the tentacle
            this.t = {
                x: target.x - 0.8 * this.dt * Math.cos(this.angle),
                y: target.y - 0.8 * this.dt * Math.sin(this.angle)
            };
            // If a target point was calculated, update the last segment's position
            // Otherwise, update the last segment's position to the target point coordinates
            if (this.t.x) {
                this.segments[this.n - 1].update(this.t);
            } else {
                this.segments[this.n - 1].update(target);
            }
            // Iterate over all segment objects, updating their position
            for (let i = this.n - 2; i >= 0; i--) {
                this.segments[i].update(this.segments[i + 1].pos);
            }
            if (
                dist(this.x, this.y, target.x, target.y) <=
                this.l + dist(last_target.x, last_target.y, target.x, target.y)
            ) {
                this.segments[0].fallback({ x: this.x, y: this.y });
                for (let i = 1; i < this.n; i++) {
                    this.segments[i].fallback(this.segments[i - 1].nextPos);
                }
            }
        }
        show(target) {
            // If the distance from the tentacle to the target is less than its length, reset the tentacle
            if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                // Set the global composite operation to 'lighter'
                c.globalCompositeOperation = "lighter";
                // Begin a new path
                c.beginPath();
                // Start drawing lines from the tentacle's starting position
                c.moveTo(this.x, this.y);
                // Iterate over all segment objects and use their show method to draw lines
                for (let i = 0; i < this.n; i++) {
                    this.segments[i].show();
                }
                // Set the line style
                c.strokeStyle = "hsl(" + (this.rand * 60 + 180) +
                    ",100%," + (this.rand * 60 + 25) + "%)";
                // Set the line width
                c.lineWidth = this.rand * 2;
                // Set line cap style
                c.lineCap = "round";
                // Set line join style
                c.lineJoin = "round";
                // Draw the lines
                c.stroke();
                // Set the global composite operation back to 'source-over'
                c.globalCompositeOperation = "source-over";
            }
        }
        // Method to draw the circular head of the tentacle
        show2(target) {
            // Start a new path
            c.beginPath();
            // If the distance from the tentacle to the target is less than its length, draw a white circle
            // Otherwise, draw a dark cyan circle
            if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                c.arc(this.x, this.y, 2 * this.rand + 1, 0, 2 * Math.PI);
                c.fillStyle = "whith";
            } else {
                c.arc(this.x, this.y, this.rand * 2, 0, 2 * Math.PI);
                c.fillStyle = "darkcyan";
            }
            // Fill the circle
            c.fill();
        }
    }

    // Initialize variables
    let maxl = 400, // Maximum length of tentacles
        minl = 50, // Minimum length of tentacles
        n = 30, // Number of segments in each tentacle
        numt = 600, // Number of tentacles
        tent = [], // Array of tentacles
        clicked = false, // Whether the mouse is pressed
        target = { x: 0, y: 0 }, // Target point for the tentacles
        last_target = {}, // Last target point for the tentacles
        t = 0, // Current time
        q = 10; // Step size for tentacle movement

    // Create tentacle objects
    for (let i = 0; i < numt; i++) {
        tent.push(
            new tentacle(
                Math.random() * w, // x-coordinate of the tentacle
                Math.random() * h, // y-coordinate of the tentacle
                Math.random() * (maxl - minl) + minl, // Length of the tentacle
                n, // Number of segments
                Math.random() * 2 * Math.PI // Angle of the tentacle
            )
        );
    }
    // Method to draw the image
    function draw() {
        // If the mouse is moving, calculate the offset for the target point
        if (mouse.x) {
            target.errx = mouse.x - target.x;
            target.erry = mouse.y - target.y;
        } else {
            // Otherwise, calculate the x-coordinate for the target point
            target.errx =
                w / 2 +
                ((h / 2 - q) * Math.sqrt(2) * Math.cos(t)) /
                (Math.pow(Math.sin(t), 2) + 1) -
                target.x;
            target.erry =
                h / 2 +
                ((h / 2 - q) * Math.sqrt(2) * Math.cos(t) * Math.sin(t)) /
                (Math.pow(Math.sin(t), 2) + 1) -
                target.y;
        }

        // Update the target point coordinates
        target.x += target.errx / 10;
        target.y += target.erry / 10;

        // Update time
        t += 0.01;

        // Draw the target point for the tentacles
        c.beginPath();
        c.arc(
            target.x,
            target.y,
            dist(last_target.x, last_target.y, target.x, target.y) + 5,
            0,
            2 * Math.PI
        );
        c.fillStyle = "hsl(210,100%,80%)";
        c.fill();

        // Draw the center points of all the tentacles
        for (i = 0; i < numt; i++) {
            tent[i].move(last_target, target);
            tent[i].show2(target);
        }
        // Draw all the tentacles
        for (i = 0; i < numt; i++) {
            tent[i].show(target);
        }
        // Update the last target point coordinates
        last_target.x = target.x;
        last_target.y = target.y;
    }
    // Function to continuously execute the drawing animation
    function loop() {
        // Use requestAnimFrame to loop the execution
        window.requestAnimFrame(loop);

        // Clear the canvas
        c.clearRect(0, 0, w, h);

        // Draw the animation
        draw();
    }

    // Listen for window resize events
    window.addEventListener("resize", function () {
        // Reset the canvas size
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;

        // Call the loop function to continue the animation
        loop();
    });

    // Call the loop function to start the animation
    loop();
    // Use setInterval to repeat
    setInterval(loop, 1000 / 60);

    // Listen for mouse move events
    canvas.addEventListener("mousemove", function (e) {
        // Record the last mouse position
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;

        // Update the current mouse position
        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
    }, false);

    // Listen for mouse leave events
    canvas.addEventListener("mouseleave", function (e) {
        // Set mouse to false
        mouse.x = false;
        mouse.y = false;
    });
};

DEV Community — A constructive and inclusive social network for software developers. With you every step of your journey.

    Home
    Tags
    About
    Contact

    Code of Conduct
    Privacy Policy
    Terms of use

Built on Forem — the open source software that powers DEV and other inclusive communities.

Made with love and Ruby on Rails. DEV Community © 2016 - 2025.
