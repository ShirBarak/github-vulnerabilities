import {request, GraphQLClient, gql} from 'graphql-request'
import dotenv from 'dotenv'

dotenv.config()

export const graphQLClient = new GraphQLClient(process.env['API_URL'] || '', {
    headers: {
        Authorization: `bearer ${process.env['GITHUB-ACCESSS-TOKEN']}`
    }
}) // throw error


