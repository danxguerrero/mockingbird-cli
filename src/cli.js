#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import {config} from 'dotenv';

// Load environment variables from .env file if present
config();

import App from './app.js';

const cli = meow(
	`
		Usage
		  $ mockingbird-cli

		Options
			--name  Your name

		Examples
		  $ mockingbird-cli --name=Jane
		  Hello, Jane
	`,
	{
		importMeta: import.meta,
	},
);

render(<App name={cli.flags.name} />);
