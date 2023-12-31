import { StatusCodes } from 'http-status-codes'
import { graphQLClient } from './client'
import { GET_VULNERABILITIES } from './query'
import { satisfies } from 'semver'

const getPackageNames = (packageJson: string) => {
    try {
        const packages = Object.entries(JSON.parse(atob(packageJson)).dependencies)
        return packages

    } catch (e) {
        throw {message: 'fileContent must be Base64 encoded packageJSON file', code: StatusCodes.BAD_REQUEST}
    }
}

const createClientRequest = (ecosystem: string, packageName: string) => graphQLClient.request(GET_VULNERABILITIES,
    {
       ecosystem,
       package: packageName
    }).catch(e => {
        throw {message: 'error in API request', code: StatusCodes.INTERNAL_SERVER_ERROR}
    })


const checkAffectedVersion = (version: string, affectedVersions: string) => satisfies(version, affectedVersions.replace(',', ''))

export const getVulnerabilities = async (ecosystem: string, packageJSON: string) => {
    const packages = getPackageNames(packageJSON)

    const vulnerablePackagesResult = await Promise.all(
        packages.map(([packageName, version]) => createClientRequest(ecosystem, packageName).then(data => {
            const vulnarableVersions = (data as any).securityVulnerabilities.nodes

            const affectedPackage = vulnarableVersions.find(vulnerability => checkAffectedVersion(version as string, vulnerability.vulnerableVersionRange))
            if (!affectedPackage) return

            return {
            name: packageName,
            version,
            severity: affectedPackage.severity,
            firstPatchedVersion: affectedPackage.firstPatchedVersion?.identifier
        }} 
        )))

        const vulnerablePackages = vulnerablePackagesResult.filter(pkg => !!pkg)

        return {
            vulnerablePackages
        }
    }

