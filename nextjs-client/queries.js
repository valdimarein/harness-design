import { gql } from "@apollo/client"

export const GET_HARNESSES = gql`
    query GetHarness($isTemplate: Boolean!) {
        getHarness(isTemplate: $isTemplate) {
            id
            projectId
            name
            url
            isTemplate
            canvas {
                id
                lines {
                    id
                    objectId
                    x1
                    x2
                    y1
                    y2
                    rect {
                        id
                        objectId
                        left
                        top
                        angle
                        circle {
                            id
                            objectId
                            left
                            top
                            branchText {
                                id
                                objectId
                                textId
                                left
                                top
                                text
                                angle
                                connectionText {
                                    id
                                    objectId
                                    textId
                                    left
                                    top
                                    text
                                    angle
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`