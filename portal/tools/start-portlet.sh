#!/usr/bin/env bash
ng serve --project portlets-$1 --output-hashing none --single-bundle true --watch --port 4000 --host 0.0.0.0
