# syntax=docker/dockerfile:1

FROM nginx:alpine

# Shared with the frontend build; unused here, declared to accept the workflow arg.
ARG NEXT_PUBLIC_API_URL

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
