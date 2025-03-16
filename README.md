# A "fun" troubleshooting problem

Here lies a minimized demonstration of a problem that I spent most of a day
tearing my hair out over. It's not a real application, but it reproduces the
problem in a fairly small sandbox.

This is a very simple Next.js app that allows you to upload an image, which
gets converted to grayscale and displayed in the browser.

## The symptom

Very simply: if you upload a file in "HEIC" format, it only works if it's the
first file uploaded. Anything after that will result in this error in the
console:

    VipsForeignLoad: "/tmp/f5a1247ee2acc326" is not a known file format

and the image will not be displayed, because it failed to convert.

## Try it out

To reproduce the problem, you need need only to run the following commands:

```bash
# Build the app into a Docker image
docker build -t vips-issue .
# Run it
docker run -it --rm -p 3000:3000 vips-issue
```

Then visit [http://localhost:3000](http://localhost:3000) in your browser. If
you don't have a HEIC file handy, you can use the sample image in this repo.
Upload it twice and note that only the first one works. You can also try
uploading JPEGs, and note that they will work every time.

## Puzzle over it

Take note of how the code in [src/app/page.tsx](src/app/page.tsx) works. It simply shells out to
the `vips` command, in the same way every time. Each invocation runs in a new
process. So how is it possible that the first one works and the second one
doesn't? Why does it only affect HEIC files? These are the mysteries that
vexed me for quite a few frustrating hours. Can you figure it out?

Note that the solution here is not "don't do that". This is a synthetic
project to demonstrate an interesting problem, and the game is to understand
what the problem is. Once it is understood, a number of solutions present
themselves.

## Read the story (and the answer)

I have a full writeup of this over at my blog:

https://chrismasto.com/blog/2025/03/15/vips
