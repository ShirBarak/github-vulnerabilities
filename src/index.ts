import express from 'express'
import { json } from 'body-parser'
import {StatusCodes} from 'http-status-codes'

import { getVulnerabilities } from './getVulnerabilities';

const VALID_ECOSYSTEMS = ['COMPOSER', 'ERLANG', 'ACTIONS', 'GO', 'MAVEN', 'NPM', 'NUGET', 'PIP', 'PUB', 'RUBYGEMS', 'RUST', 'SWIFT']

const parseBody = (body): {encodedPackageJSON: string; ecosystem: string} => {
    const encodedPackageJSON = body.fileContent

    if (!encodedPackageJSON) throw {message: 'encoded packageJSON file is required', code: StatusCodes.BAD_REQUEST}

    const ecosystem = VALID_ECOSYSTEMS.find(ecosystem => ecosystem === body.ecosystem.toUpperCase())

    if (!ecosystem) throw {message: `ecosystem must be one of the following: ${VALID_ECOSYSTEMS.join(', ')}`, code: StatusCodes.BAD_REQUEST}

    return {
        ecosystem,
        encodedPackageJSON
    }
}

const app = express();

app.get('/health', (req, res) => {
    return res.json('health')
})

app.post('/scan', json(), async (req, res) => {
    try {
        const inputBody = req.body
        const {ecosystem, encodedPackageJSON} = parseBody(inputBody)
        const vulnerablePackages = await getVulnerabilities(ecosystem, encodedPackageJSON)
        return res.json(vulnerablePackages)
    } catch(e) {
        res.statusCode = e.code || StatusCodes.INTERNAL_SERVER_ERROR
        res.send(e.message || 'an error occured')
    }
})

app.listen(3000)