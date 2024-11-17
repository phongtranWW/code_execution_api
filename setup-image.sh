#!/bin/bash
languages=("cpp" "java" "js" "python")

for lang in "${languages[@]}"
do
  docker build -t ${lang}-execution -f $(pwd)/environments/${lang}/Dockerfile.${lang} $(pwd)/environments/${lang}
done
