import Text from "../components/Text"
import sanityClient from "../lib/sanity"
import Canvas from "../components/Canvas"
import Button from "../components/Button"
import Loading from "../components/Loading"
import GridTable from "../components/Table"
import Contact from "../components/Contact"
import { useTimer } from "../hooks/useTimer"
import React, { useRef, useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { GET_HARNESSES } from "../page-functions/graphql/queries"
import { CreateHarnessTableData } from "../page-functions/CreateHarnessTableData"
import { UPDATE_CANVAS, CREATE_HARNESS, CREATE_BRANCH, DELETE_BRANCH, UPDATE_BRANCH_TEXT, UPDATE_CONNECTION_TEXT, RESET_HARNESS } from "../page-functions/graphql/mutations"

export let sanity_harness

function Home({ harness }) {
    /** Sanity Content **/
    sanity_harness = harness
    const home_body = harness?.map((item) => item.home_body).flat()
    const tech_stack = harness?.map((item) => item.tech_stack).flat()

    /** Page State **/
    let initialLoad = useRef(false)
    const [showTable, setShowTable] = useState(false)
    const [compileTime, setCompileTime] = useState()

    /** GraphQl Queries **/
    const { data: getHarnesses, loading: getHarnessLoading } = useQuery(GET_HARNESSES, {
        variables: {
            isTemplate: true,
        },
    })

    /** GraphQl Mutations **/
    const [UpdateCanvas, { loading: updateCanvasLoading }] = useMutation(UPDATE_CANVAS)
    const [CreateBranch, { loading: createBranchLoading }] = useMutation(CREATE_BRANCH)
    const [DeleteBranch, { loading: deleteBranchLoading }] = useMutation(DELETE_BRANCH)
    const [UpdateBranchText, { loading: updateBranchTextLoading }] = useMutation(UPDATE_BRANCH_TEXT)
    const [UpdateConnectionText, { loading: updateConnectionTextLoading }] = useMutation(UPDATE_CONNECTION_TEXT)
    const [CreateHarness, { data: createHarnessData, loading: createHarnessLoading }] = useMutation(CREATE_HARNESS)
    const [ResetHarness, { loading: resetHarnessLoading }] = useMutation(RESET_HARNESS, {
        refetchQueries: [
            {
                query: GET_HARNESSES,
                variables: {
                    isTemplate: true,
                },
            },
            "GetHarness",
        ],
        update: () => {
            initialLoad.current = false
        },
    })

    /** Condition GetHarness & CreateHarness Data **/
    const tableData = CreateHarnessTableData(createHarnessData, setShowTable)

    /** Misc Handlers & Hooks **/
    useTimer(createHarnessLoading, setCompileTime)

    return (
        <div className="flex flex-row min-h-screen">
            {/** Page Left: Not currently needed **/}
            <div className="basis-128"></div>

            {/** Page Center: Canvas & Main content displayed to user **/}
            <div className="flex justify-center basis-full ">
                {getHarnessLoading || resetHarnessLoading ? (
                    <Loading text={resetHarnessLoading ? "Resetting harness" : "Loading..."} />
                ) : (
                    <div className="flex flex-row justify-center w-full">
                        <div className="flex flex-col w-full">
                            <Canvas
                                getHarnesses={getHarnesses}
                                initialLoad={initialLoad}
                                CreateBranch={CreateBranch}
                                ResetHarness={ResetHarness}
                                UpdateCanvas={UpdateCanvas}
                                setShowTable={setShowTable}
                                DeleteBranch={DeleteBranch}
                                CreateHarness={CreateHarness}
                                UpdateBranchText={UpdateBranchText}
                                createHarnessLoading={createHarnessLoading}
                                UpdateConnectionText={UpdateConnectionText}
                            />
                            {createHarnessData && showTable && <GridTable tableData={tableData} setShowTable={setShowTable} />}
                            {(createHarnessLoading || !showTable) && (
                                <div>
                                    <Text content={home_body} />
                                    <Text content={tech_stack} />
                                    <Contact />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/** Page Right: Display Mutation & Query Loading states to user **/}
            <div className="basis-128">
                {compileTime && <Button text={`Compile Time: ${compileTime} sec`} divClassName="mb-5 w-full flex justify-center" />}
                {updateCanvasLoading && <Loading text="Update Branch" className="mb-5 w-full flex justify-center" />}
                {createBranchLoading && <Loading text="Create Branch" className="mb-5 w-full flex justify-center" />}
                {deleteBranchLoading && <Loading text="Delete Branch" className="mb-5 w-full flex justify-center" />}
                {createHarnessLoading && <Loading text="Compiling Harness" className="mb-5 w-full flex justify-center" />}
                {updateBranchTextLoading && <Loading text="Update Branch Text" className="mb-5 w-full flex justify-center" />}
                {updateConnectionTextLoading && <Loading text="Update Connection Text" className="mb-5 w-full flex justify-center" />}
            </div>
        </div>
    )
}

/** Fetch data from Sanity CMS **/
export async function getStaticProps() {
    const harness = await sanityClient.fetch(`*[_type == "home"]`)
    return {
        props: {
            harness,
        },
    }
}

export default Home
