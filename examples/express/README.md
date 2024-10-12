# @saascannon/auth express example

This example demonstrates the usage of the @saascannon/auth package express wrapper

## Setup

To setup this example you will need the following things.

- A Saasannon tenant to test with
  - An application with an allowed redirect url `http://localhost:3030`
- A `.env` file containing the following values (see `.env.example` for more details)
  - `SAASCANNON_CLIENT_ID`
  - `SAASCANNON_DOMAIN`

Once you have these, you can then run `npm ci` and `npm run dev` to run the example project.

## Testing Permissions

Once you have logged in using the example you can make requests to the test endpoints. Play around with assigning permissions to your testing user using the [saascannon dashboard](https://dash.saascannon.com).

### Required route permissions

| Route                   | Permissions                                   |
| ----------------------- | --------------------------------------------- |
| `/protected-endpoint-1` | `posts:publish` OR `admin`                    |
| `/protected-endpoint-2` | (`posts:publish` AND `posts:read`) OR `admin` |
