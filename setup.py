from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as f:
    requirements = f.read().splitlines()

setup(
    name="airtable-mcp",
    version="0.1.0",
    author="Rashid Azarang",
    author_email="your.email@example.com",
    description="Airtable integration tools for AI via Anthropic's Model Context Protocol",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/rashidae/airtable-mcp",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.10",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "airtable-mcp=airtable_mcp.server:main",
        ],
    },
) 