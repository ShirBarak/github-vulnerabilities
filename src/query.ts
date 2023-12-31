import {gql} from 'graphql-request'

export const GET_VULNERABILITIES = gql`
query getSecurityVulnerabilities($ecosystem: SecurityAdvisoryEcosystem!, $package: String!){
    securityVulnerabilities(ecosystem: $ecosystem, first: 100, package: $package) {
      nodes {
        severity
        package {
           name 
          ecosystem 
         }
         vulnerableVersionRange
         firstPatchedVersion {
           identifier
         }
       } 
     }
   } 

`