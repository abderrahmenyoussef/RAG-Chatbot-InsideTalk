import { title } from "process"
import "./global.css"

export const metadata = {
    title: "InsideTalk",
    description: "Explore the world of tech jobs with InsideTalk"
}

const Rootlayout = ({ children }: { children }) => {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}

export default Rootlayout