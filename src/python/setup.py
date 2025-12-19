#!/usr/bin/env python3

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as req_file:
    requirements = req_file.read().splitlines()

setup(
    name="airtable-mcp",
    version="1.1.0",
    author="Rashid Azarang",
    author_email="rashidazarang@gmail.com",
    description="Airtable MCP for AI tools - updated to work with MCP SDK 1.4.1+",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/rashidazarang/airtable-mcp",
    packages=find_packages(),
    install_requires=requirements,
    classifiers=[
        "Programming Language :: Python :: 3.10",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.10",
    include_package_data=True,
) 