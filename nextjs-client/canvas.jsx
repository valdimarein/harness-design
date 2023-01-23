import { fabric } from "fabric"
import Select from "../Select"
import Button from "../Button"
import ToggleOcr from "./ToggleOcr"
import TextInput from "./TextInput"
import LoadButton from "./LoadCanvas"
import DeleteButton from "./DeleteButton"
import { LoadCanvas } from "./LoadCanvas"
import CreateButton from "./CreateButton"
import CompileButton from "./CompileButton"
import ResetHarnessButton from "./ResetHarness"
import { handleUpdateBranch } from "./UpdateOnCanvas"
import React, { useEffect, useRef, useState } from "react"
import { SetHarness } from "../../page-functions/SetHarness"

const Canvas = ({
    getHarnesses,
    initialLoad,
    setShowTable,
    CreateBranch,
    UpdateCanvas,
    ResetHarness,
    DeleteBranch,
    CreateHarness,
    UpdateBranchText,
    UpdateConnectionText,
    createHarnessLoading,
}) => {
    /** Page State **/
    const isSelect = false
    const canvasRef = useRef(null)
    const [isOcr, setIsOcr] = useState(false)
    const [fabricCanvas, setFabricCanvas] = useState()
    const [selected, setSelected] = useState(-1)

    /** Provide all harnesses to select & structure data to LoadCanvas() **/
    const [items, data, canvasId, current] = SetHarness(getHarnesses, selected)

    /** Create Fabric instance **/
    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 750,
            height: 500,
            isDrawingMode: false,
            backgroundColor: "white",
        })

        /** Set instance into state to be passed into child components **/
        setFabricCanvas(canvas)

        /** Object Moving: Update relevant objects on Canvas when dragged **/
        canvas.on("object:moving", function (e) {
            let p = e.target

            /** Object Moving: Single Object dragged **/
            p.circleItem && p.circleItem.set({ left: p.left, top: p.top })
            p.lineItem && p.lineItem.set({ x2: p.circleItem.left, y2: p.circleItem.top })
            p.rectItem && p.rectItem.set({ left: p.lineItem.left, top: p.lineItem.top })
            p.branchTextItem && p.branchTextItem.set({ left: p.circleItem.left, top: p.circleItem.top })
            p.connectionTextItem && p.connectionTextItem.set({ left: p.rectItem.left, top: p.rectItem.top })

            p.setCoords()
            p.lineItem.setCoords()
            p.rectItem.setCoords()
            p.circleItem.setCoords()
            p.branchTextItem.setCoords()
            p.connectionTextItem.setCoords()

            let all = canvas.getObjects()

            /** Object Moving: Update moving objects children to reflect new position **/
            if (p.type === "branchText" || "connectionText") {
                p.branchTextItem.childIds.forEach((id) => {
                    all.forEach((item) => {
                        if (item.objectId === id) {
                            item.lineItem && item.lineItem.set({ x1: p.lineItem.x2, y1: p.lineItem.y2 })
                            item.rectItem && item.rectItem.set({ left: item.lineItem.left, top: item.lineItem.top })
                            item.connectionTextItem && item.connectionTextItem.set({ left: item.rectItem.left, top: item.rectItem.top })

                            item.setCoords()
                            item.rectItem.setCoords()
                            item.lineItem.setCoords()
                            item.circleItem.setCoords()
                            item.branchTextItem.setCoords()
                            item.connectionTextItem.setCoords()
                        }
                    })
                })
            }
            canvas.renderAll()
        })

        /** Mouse Up: Trigger UpdateBranch Mutation on mouse up **/
        canvas.on("mouse:up", function (e) {
            let p = e.target

            if (p !== null) {
                /** Update Parent **/
                if (p.type === "branchText" || "connectionText") {
                    handleUpdateBranch(UpdateCanvas, p)

                    /** Update Children **/
                    if (p.type === "branchText") {
                        let all = canvas.getObjects()
                        p.childIds.forEach((child) => {
                            all.forEach((item, idx) => {
                                if (child === item.objectId) {
                                    if (item.type === "branchText") {
                                        let p = canvas.item(idx)
                                        handleUpdateBranch(UpdateCanvas, p)
                                    }
                                }
                            })
                        })
                    }
                }
            }
            canvas.renderAll()
        })

        /** Object Added: Send all Lines to the back to ensure they cannot impede the text **/
        canvas.on("object:added", function () {
            let all = canvas.getObjects()

            let lines = []
            all.forEach((item, idx) => {
                if (item.type === "line") {
                    lines.push(idx)
                }
            })
            lines.forEach((item) => {
                let p = canvas.item(item)
                p.sendToBack()
            })

            canvas.renderAll()
        })

        return () => {
            canvas.dispose()
        }
    }, [canvasRef])

    /** Load default harness "base_harness" once Canvas is rendered  **/

    if (fabricCanvas) {
        if (initialLoad.current === false) {
            if (current.name === "base_harness") {
                initialLoad.current = true
                LoadCanvas(data, fabricCanvas)
            }
        }
    }

    return (
        <div className="flex flex-col justify-center">
            {/** Select Component to allow user to fork & rename harnesses. Not available in Demo **/}
            {isSelect && (
                <div className="pb-5 flex justify-evenly">
                    <Select items={items} className="w-56" selected={selected} setSelected={setSelected} title="Select Harness" />
                    <LoadButton fabricCanvas={fabricCanvas} data={data} />
                    <Button text="New Harness" />
                    <input type="text" placeholder="Harness name..." className="input w-full max-w-xs" />
                </div>
            )}

            {/** Render Canvas on Page **/}
            <div className="flex justify-center">
                <canvas className="rounded-lg" ref={canvasRef}></canvas>
            </div>

            {/** Render UI Buttons **/}
            <div className="pt-5 flex justify-evenly">
                <CreateButton fabricCanvas={fabricCanvas} CreateBranch={CreateBranch} canvasId={canvasId} />
                <DeleteButton fabricCanvas={fabricCanvas} DeleteBranch={DeleteBranch} />
                <CompileButton
                    isOcr={isOcr}
                    current={current}
                    setShowTable={setShowTable}
                    fabricCanvas={fabricCanvas}
                    CreateHarness={CreateHarness}
                    createHarnessLoading={createHarnessLoading}
                />
                <ResetHarnessButton canvasId={canvasId} current={current} initialLoad={initialLoad} ResetHarness={ResetHarness} disabled={createHarnessLoading} />
                <ToggleOcr isOcr={isOcr} setIsOcr={setIsOcr} disabled={createHarnessLoading} />
            </div>

            <div>
                {/** Text Input to update text objects on Canvas **/}
                <TextInput className="pt-5 flex justify-center" fabricCanvas={fabricCanvas} UpdateBranchText={UpdateBranchText} UpdateConnectionText={UpdateConnectionText} />
            </div>
        </div>
    )
}

export default Canvas
